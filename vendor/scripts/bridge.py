# -*- coding: utf-8 -*-
"""
dsh-jmcomic bridge — 所有 Python 操作的单入口(host 通过 subprocess 调用)。

设计目标:在未安装 jmcomic 库的情况下也能运行。实现方式:
1. 插件 vendor/python 内已内置 jmcomic 源码 + commonX(纯 Python)源码;
2. 本脚本通过 sys.path 优先加载内置源码,系统已安装的 jmcomic 会被内置副本遮蔽;
3. 二进制依赖(curl_cffi / Pillow / pycryptodome / yaml 的 C 加速)检测缺失时自动降级:
   - curl_cffi 缺失 -> postman 用 requests(纯 Python)
   - Pillow 缺失 -> 关闭图片解码(decode: False),仅下载不解码
   - pycryptodome 缺失 -> api 客户端不可用时提示安装
4. 每次调用都返回 JSON:{ok, data/error}。
"""
import argparse
import json
import os
import sys

# Windows 控制台默认 GBK,强制 UTF-8 输出(Claude 实战经验:PYTHONIOENCODING=utf-8)
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:  # noqa: BLE001
        pass
os.environ['PYTHONIOENCODING'] = 'utf-8'

# --- 1. 定位插件 vendor/python,让内置源码可导入 -------------------------------
# bridge.py 位于 <plugin>/vendor/scripts/,内置包在 <plugin>/vendor/python/
VENDOR_PY = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'python')
if VENDOR_PY not in sys.path:
    sys.path.insert(0, VENDOR_PY)

# --- 2. 探测可选二进制依赖 ----------------------------------------------------
MISSING = []


def probe(mod_name: str, import_name: str | None = None):
    try:
        __import__(import_name or mod_name)
        return True
    except ImportError:
        MISSING.append(mod_name)
        return False


HAS_CURL_CFFI = probe('curl_cffi')
HAS_PIL = probe('Pillow', 'PIL')
HAS_CRYPTO = probe('pycryptodome', 'Crypto')

# 即使 curl_cffi 缺失,jmcomic 也能以 requests postman 工作
IMPORT_OK = True
IMPORT_ERROR = ''
try:
    import jmcomic  # noqa: F401  触发真正的 import,缺依赖时这里抛错
    # jmcomic 的日志默认打到 stdout,会污染 JSON 输出 -> 重定向到 stderr
    import logging
    _jm_logger = logging.getLogger('jmcomic')
    for _h in list(_jm_logger.handlers):
        if isinstance(_h, logging.StreamHandler) and getattr(_h, 'stream', None) is sys.stdout:
            _h.setStream(sys.stderr)
except Exception as e:  # noqa: BLE001
    IMPORT_OK = False
    IMPORT_ERROR = f'{type(e).__name__}: {e}'


def status() -> dict:
    return {
        'ok': IMPORT_OK,
        'vendor': VENDOR_PY,
        'python': sys.executable,
        'version': sys.version.split()[0],
        'jmcomic_import_ok': IMPORT_OK,
        'jmcomic_import_error': IMPORT_ERROR,
        'curl_cffi': HAS_CURL_CFFI,
        'pillow': HAS_PIL,
        'pycryptodome': HAS_CRYPTO,
        'missing': MISSING,
    }


# --- 3. 构建带降级的 option ---------------------------------------------------
def build_option(option_path: str = '', base_dir: str = ''):
    """
    创建 jmcomic option。
    - 优先加载 option_path(用户配置);
    - 未提供时生成默认配置并注入 base_dir / 降级设置。
    """
    import jmcomic
    from jmcomic import JmModuleConfig, create_option_by_file

    if option_path and os.path.exists(option_path):
        return create_option_by_file(option_path)

    # 默认配置
    opt = JmModuleConfig.option_class().default()
    d = opt.deconstruct()

    # Claude 实战经验(2026-08 验证):
    # ① impl=api 走 APP API 域名(www.cdnhjk.net 等)国内直连即可下载,
    #    无需代理/cf_clearance;html impl(18comic.vip 网页)才是 CF 挑战根源。
    # ② 低并发 image:3 / photo:1,避免禁漫限流;提速靠批量多本并行而非单本大并发。
    d.setdefault('client', {})['impl'] = 'api'
    d.setdefault('download', {}).setdefault('threading', {})['image'] = 3
    d.setdefault('download', {}).setdefault('threading', {})['photo'] = 1
    # 图片解码默认开(禁漫图片是加扰的,必须 decode 才可看)
    d.setdefault('download', {}).setdefault('image', {})['decode'] = True

    # 降级:无 curl_cffi -> requests postman
    if not HAS_CURL_CFFI:
        d.setdefault('client', {})['postman'] = {
            'type': 'requests',
            'meta_data': {'headers': None, 'proxies': None},
        }
    # 降级:无 Pillow -> 关闭解码(仅下载不解码,图片不可看但文件完整)
    if not HAS_PIL:
        d.setdefault('download', {}).setdefault('image', {})['decode'] = False

    # 目录规则:合集每章独立子目录(防同名覆盖,Claude 实战经验 478919 案例)
    if base_dir:
        d['dir_rule'] = {'rule': 'Bd/{Atitle}/第{Pindex}話', 'base_dir': base_dir}
    else:
        # 不传 base_dir 时保留默认(当前目录),只确保章节级目录规则
        cur = d.get('dir_rule') or {}
        d['dir_rule'] = {'rule': 'Bd/{Atitle}/第{Pindex}話', 'base_dir': cur.get('base_dir')}

    return JmModuleConfig.option_class().construct(d)


def ok(data):
    print(json.dumps({'ok': True, 'data': data}, ensure_ascii=False))
    sys.exit(0)


def fail(msg):
    print(json.dumps({'ok': False, 'error': msg}, ensure_ascii=False))
    sys.exit(1)


# --- 4. 子命令实现 ------------------------------------------------------------
def cmd_status(args):
    ok(status())


def cmd_search(args):
    if not IMPORT_OK:
        fail(IMPORT_ERROR)
    import jmcomic
    option = build_option(args.option, args.base_dir)
    client = option.build_jm_client()
    try:
        page = client.search(
            args.keyword,
            page=args.page,
            main_tag=0,
            order_by=jmcomic.JmMagicConstants.ORDER_BY_LATEST,
            time=jmcomic.JmMagicConstants.TIME_ALL,
            category=jmcomic.JmMagicConstants.CATEGORY_ALL,
            sub_category=None,
        )
        albums = []
        for album_id, ainfo in page.content:
            albums.append({
                'id': str(album_id),
                'title': str(ainfo.get('name', '')),
                'tags': ainfo.get('tags', []),
                'cover': jmcomic.JmcomicText.get_album_cover_url(str(album_id)),
                'likes': ainfo.get('likes', ''),
            })
        ok({'albums': albums, 'total': len(albums), 'keyword': args.keyword})
    except Exception as e:  # noqa: BLE001
        fail(f'search failed: {type(e).__name__}: {e}')


def cmd_browse(args):
    """分类/排行浏览:time=day/week/month/all, order=latest/likes/views/pictures/score/comments, category=all/doujin/..."""
    if not IMPORT_OK:
        fail(IMPORT_ERROR)
    import jmcomic
    mc = jmcomic.JmMagicConstants
    order_map = {
        'latest': mc.ORDER_BY_LATEST, 'likes': mc.ORDER_BY_LIKE,
        'views': mc.ORDER_BY_VIEW, 'pictures': mc.ORDER_BY_PICTURE,
        'score': mc.ORDER_BY_SCORE, 'comments': mc.ORDER_BY_COMMENT,
    }
    time_map = {'day': mc.TIME_TODAY, 'week': mc.TIME_WEEK, 'month': mc.TIME_MONTH, 'all': mc.TIME_ALL}
    category_map = {
        'all': mc.CATEGORY_ALL, 'doujin': mc.CATEGORY_DOUJIN, 'single': mc.CATEGORY_SINGLE,
        'short': mc.CATEGORY_SHORT, 'hanman': mc.CATEGORY_HANMAN, 'meiman': mc.CATEGORY_MEIMAN,
        'cosplay': mc.CATEGORY_DOUJIN_COSPLAY, '3d': mc.CATEGORY_3D, 'other': mc.CATEGORY_ANOTHER,
    }
    order = order_map.get(args.order)
    time_v = time_map.get(args.time_range)
    category = category_map.get(args.category)
    if order is None or time_v is None or category is None:
        fail(f'invalid browse args: order={args.order} time={args.time_range} category={args.category}')
    option = build_option(args.option, args.base_dir)
    client = option.build_jm_client()
    try:
        page = client.categories_filter(
            page=args.page, time=time_v, category=category, order_by=order, sub_category=None,
        )
        albums = []
        for album_id, ainfo in page.content:
            albums.append({
                'id': str(album_id),
                'title': str(ainfo.get('name', '')),
                'tags': ainfo.get('tags', []),
                'cover': jmcomic.JmcomicText.get_album_cover_url(str(album_id)),
                'likes': ainfo.get('likes', ''),
            })
        ok({'albums': albums, 'total': len(albums), 'order': args.order, 'time': args.time_range})
    except Exception as e:  # noqa: BLE001
        fail(f'browse failed: {type(e).__name__}: {e}')


def cmd_download(args):
    if not IMPORT_OK:
        fail(IMPORT_ERROR)
    import jmcomic
    option = build_option(args.option, args.base_dir)
    try:
        # 单章节下载用 download_photo,整本用 download_album
        result = option.download_photo(args.album_id) if args.photo else option.download_album(args.album_id)
        detail = getattr(result, 'detail', None)
        ok({
            'id': args.album_id,
            'title': str(detail.name) if detail is not None else '',
            'save_path': str(getattr(detail, 'save_path', '')) if detail is not None else '',
        })
    except Exception as e:  # noqa: BLE001
        fail(f'download failed: {type(e).__name__}: {e}')


def cmd_album(args):
    if not IMPORT_OK:
        fail(IMPORT_ERROR)
    import jmcomic
    option = build_option(args.option, args.base_dir)
    client = option.build_jm_client()
    try:
        album = client.get_album_detail(args.album_id)
        photos = []
        for photo in album:
            # api 客户端下 photo.image_list 可能为 None(需单独 fetch),
            # 用 album 页自带的 image 字段计数(缺失时为 0,前端可再拉取)
            pages = 0
            try:
                pages = len(photo)
            except TypeError:
                pass
            if pages == 0 and getattr(photo, 'image_list', None):
                pages = len(photo.image_list)
            photos.append({'id': str(photo.photo_id), 'title': str(photo.name), 'pages': pages})
        ok({
            'id': str(album.album_id),
            'title': str(album.name),
            'author': str(album.author),
            'likes': album.likes,
            'views': album.views,
            'tags': album.tags,
            'description': str(album.description),
            'chapters': photos,
        })
    except Exception as e:  # noqa: BLE001
        fail(f'album failed: {type(e).__name__}: {e}')


def cmd_env(args):
    """检查 python 环境是否具备完整离线能力,供首次提示判断。"""
    s = status()
    s['needs_install_prompt'] = (not IMPORT_OK) or (not HAS_CRYPTO)
    ok(s)


def main():
    parser = argparse.ArgumentParser(prog='dsh-jmcomic-bridge')
    sub = parser.add_subparsers(dest='command', required=True)

    p_status = sub.add_parser('status')
    p_status.set_defaults(func=cmd_status)

    p_env = sub.add_parser('env')
    p_env.set_defaults(func=cmd_env)

    p_search = sub.add_parser('search')
    p_search.add_argument('keyword')
    p_search.add_argument('--page', type=int, default=1)
    p_search.add_argument('--option', default='')
    p_search.add_argument('--base-dir', default='')
    p_search.set_defaults(func=cmd_search)

    p_browse = sub.add_parser('browse')
    p_browse.add_argument('--time-range', default='all', choices=['day', 'week', 'month', 'all'])
    p_browse.add_argument('--order', default='latest',
                          choices=['latest', 'likes', 'views', 'pictures', 'score', 'comments'])
    p_browse.add_argument('--category', default='all',
                          choices=['all', 'doujin', 'single', 'short', 'hanman', 'meiman', 'cosplay', '3d', 'other'])
    p_browse.add_argument('--page', type=int, default=1)
    p_browse.add_argument('--option', default='')
    p_browse.add_argument('--base-dir', default='')
    p_browse.set_defaults(func=cmd_browse)

    p_dl = sub.add_parser('download')
    p_dl.add_argument('album_id')
    p_dl.add_argument('--photo', action='store_true', help='单章节下载(photo id)')
    p_dl.add_argument('--option', default='')
    p_dl.add_argument('--base-dir', default='')
    p_dl.set_defaults(func=cmd_download)

    p_album = sub.add_parser('album')
    p_album.add_argument('album_id')
    p_album.add_argument('--option', default='')
    p_album.add_argument('--base-dir', default='')
    p_album.set_defaults(func=cmd_album)

    args = parser.parse_args()
    try:
        args.func(args)
    except SystemExit:
        raise
    except Exception as e:  # noqa: BLE001
        import traceback
        traceback.print_exc(file=sys.stderr)
        fail(f'{type(e).__name__}: {e}')


if __name__ == '__main__':
    main()

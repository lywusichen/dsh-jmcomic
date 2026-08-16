# dsh-jmcomic

**简体中文** · [English](./README.md) · [日本語](./README.ja.md)

DeepSeek Harness 插件:在侧栏底部添加 **comic** 按钮,提供 JMComic(禁漫天堂)的搜索下载、本地漫画库浏览与内置阅读器。

## 功能

- **侧栏按钮**:侧栏底部 "comic" 触发按钮(技能按钮上方)。
- **小窗**:搜索框(输入编号/名称检索)+ "导入本地文件夹"按钮;绑定目录后显示最近阅读/下载的 2-3 个封面 + "更多"按钮。
- **大悬浮窗**:居中模糊背景网格展示本地文件夹全部漫画;点击任意漫画进入章节列表,再点章节**在窗内直接阅读**(复用 jm-view-server 阅读器:下拉/单页/双页、缩略图总览、旋转、快捷键)。
- **设置**:设置 → 插件 → 插件配置 → jmcomic 卡,可修改默认本地文件夹与 Python 路径;大悬浮窗内也有"更改文件目录"按钮。
- **首次提示**:首次加载检测到 jmcomic 环境不完整时弹出推荐安装对话框(附 GitHub 网址),仅提示一次。
- **可拖动**:小窗与大悬浮窗均可拖动。
- **删除**:悬停漫画卡片显示删除按钮(带安全护栏:仅可删库目录下的专辑,禁止删根目录与系统目录)。
- **下载横幅**:下载进行时,小窗与大悬浮窗顶部均显示 "downloading …"。

## 截图

![侧栏 comic 按钮](assets/comic-trigger.png)

![小窗:搜索 + 本地封面](assets/comic-pop.png)

![大悬浮窗:本地漫画库网格](assets/comic-library.png)

## 离线运行

插件内置了:

- `vendor/python/jmcomic` — JMComic-Crawler-Python 2.7.3 源码
- `vendor/python/common` — commonX 纯 Python 源码
- `vendor/python/jmcomic_ai` — jmcomic-ai 包(供内置脚本使用)
- `vendor/scripts/*.py` — 下载/搜索/转换等脚本
- `vendor/viewer/static` — jm-view-server 阅读器前端

因此**即使未安装 jmcomic PyPI 包**也能运行。缺失二进制依赖时自动降级:

| 缺失依赖 | 降级行为 |
|---|---|
| curl_cffi | postman 改用 requests |
| Pillow | 关闭图片解码(文件可下载但不可预览) |
| pycryptodome | 提示安装 |

## 安装

```bash
dsh plugin --profile web add github:lywusichen/dsh-jmcomic
```

## 构建

```bash
npm install   # 开发依赖: esbuild
npm run build # 生成 lib/client.js + lib/server.cjs(已提交)
```

## 自检

```bash
node selfcheck.cjs   # 用 stub ctx 验证全部 /jmcomic/* 路由
```

## 配置

- 设置文件:`~/.dsh/plugins/dsh-jmcomic/settings.json`(Windows)
- 下载策略(实战验证):`client.impl: api` 国内直连、目录规则 `Bd/{Atitle}/第{Pindex}話`、低并发(image 3 / photo 1)。

## 声明

本插件的下载内核、阅读器前端与辅助脚本参考自(部分改编自)**hect0x7** 的开源项目:

- [JMComic-Crawler-Python](https://github.com/hect0x7) — 内置下载核心(`vendor/python/jmcomic`、commonX)
- [jm-view-server](https://github.com/hect0x7) — 内置阅读器前端(`vendor/viewer/static`)
- [jmcomic-ai](https://github.com/hect0x7) — 内置辅助脚本与服务层(`vendor/python/jmcomic_ai`、`vendor/scripts`)

原项目版权归其各自作者所有。本插件为独立整合,在各自原始许可证下内置上述源码以实现离线运行。

## 致谢

- [JMComic-Crawler-Python](https://github.com/hect0x7/JMComic-Crawler-Python) — 下载内核
- [jm-view-server](https://github.com/hect0x7/jm-view-server) — 阅读器前端
- [jmcomic-ai](https://github.com/hect0x7/jmcomic-ai) — 附加脚本

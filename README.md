<div align=center>
<img  src="docs/LOGO.svg"  width="100" />
</div>

<h1 align="center">
  VIDAA
</h1>

<p align="center">
  <a href="./docs/README_EN.md">English</a>
</p>

## 什么是 VIDAA

**VIDAA (Video Instant Distribution & Assemble Automation)** —— 同时，“VIDA”在葡萄牙语中意为“生活”。

VIDAA是一个一站式视频制作分发平台，通过大模型的能力制作指定主题的简单视频，同时可以一键发布到国内主流视频平台。

## 为什么要做 VIDAA

作为一名AI Infra工程师，我每天都与大模型打交道，主要涉及模型适配、性能调优以及针对特定硬件平台的开发，但在应用层面我始终感觉知识还不够全面。

本项目是我第一个 AI 应用类项目，希望借此机会深入探索大模型在实际视频内容创作中的潜力，同时也希望重拾我在转行前积累的前后端开发经验。

## 运行指南

本项目采用前后端分离架构。各部分的具体运行方式请参阅相应子文件夹中的 README 文件。

## 功能特性

### 后端能力

- **视频生成**
  - [x] RSS抓取
  - [x] 主题解析
  - [x] 生成文案
  - [x] 音频与字幕文件生成
  - [x] 图片获取 (使用 [pexels](https://pexels.com))
  - [x] 视频打包
  - [ ] 视频版权添加
- **视频发布**
  - [ ] 抖音
  - [ ] 小红书
  - [ ] bilibili
  - [ ] 其余待支持的平台...

### 前端能力

- [x] RSS 源的展示
- [ ] 提供用户友好的视频生成各步骤操作界面
  - [x] 主题选择
  - [x] 文案生成
  - [x] 音频生成
  - [x] 字幕生成
  - [x] 图片获取
  - [ ] 视频打包
  - [ ] 视频版权添加
- [ ] 各视频平台统一管理登录状态
- [ ] 视频实时发布状态展示
- [ ] 往期视频信息展示

## 致谢

视频上传功能参考了以下项目，鸣谢项目作者们对于开源的贡献，以下排名不分先后，正因为有先驱者的探索，才有了此项目顺利落地。

- [dreammis/social-auto-upload](https://github.com/dreammis/social-auto-upload)
- [ReaJason/xhs](https://github.com/ReaJason/xhs)
- [Superheroff/douyin_uplod](https://github.com/Superheroff/douyin_uplod)
- [lishang520/DouYin-Auto-Upload](https://github.com/lishang520/DouYin-Auto-Upload)
- [kebenxiaoming/matrix](https://github.com/kebenxiaoming/matrix)
- [biliup/biliup-rs](https://github.com/biliup/biliup-rs)

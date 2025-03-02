<div align="center">
  <img src="./LOGO.svg" alt="VIDAA" width="100" />
</div>

<h1 align="center">
  VIDAA
</h1>

## What is VIDAA

**VIDAA (Video Instant Distribution & Assemble Automation)** — and note, “VIDA” means “life” in Portuguese.

VIDAA is an all-in-one platform for video creation and distribution. It leverages large model capabilities to generate simple videos on specified themes and enables one-click publishing to major domestic video platforms.

## Why Build VIDAA

As an AI infrastructure engineer, I work with large models daily—mainly focusing on model adaptation, performance tuning, and development for specific hardware platforms. However, I’ve always felt that my knowledge of the application layer is somewhat lacking.

VIDAA is my first AI application project. I aim to use this project as an opportunity to delve deeper into the potential of large models in practical video content creation while also revisiting the full-stack development skills I honed before switching careers.

## Getting Started

This project adopts a decoupled front-end and back-end architecture. Please refer to the README files in the respective subdirectories for detailed instructions on how to run each component.

## Features

### Back-End Capabilities

- **Video Generation**
  - [x] RSS feed fetching
  - [x] Topic analysis
  - [x] Copywriting generation
  - [x] Audio and subtitle file creation
  - [x] Image fetching (using [pexels](https://pexels.com))
  - [x] Video packaging
  - [ ] Video copyright addition
- **Video Distribution**
  - [ ] Douyin
  - [ ] Xiaohongshu
  - [ ] bilibili
  - [ ] Other platforms to be supported...

### Front-End Capabilities

- [x] RSS feed display
- [ ] user-friendly interface for each step of video creation
  - [x] theme selection
  - [x] copywriting generation
  - [x] audio generation
  - [x] subtitle generation
  - [x] image fetching
  - [x] video packaging
  - [ ] video copyright addition
- [ ] Unified management of login status across video platforms
- [ ] Real-time display of video publishing status
- [ ] Display historical video information

## Acknowledgements

The video upload functionality is inspired by the following projects, thank you for your contributions to open source, without your exploration, this project would not have been possible:

- [dreammis/social-auto-upload](https://github.com/dreammis/social-auto-upload)
- [ReaJason/xhs](https://github.com/ReaJason/xhs)
- [Superheroff/douyin_uplod](https://github.com/Superheroff/douyin_uplod)
- [lishang520/DouYin-Auto-Upload](https://github.com/lishang520/DouYin-Auto-Upload)
- [kebenxiaoming/matrix](https://github.com/kebenxiaoming/matrix)
- [biliup/biliup-rs](https://github.com/biliup/biliup-rs)

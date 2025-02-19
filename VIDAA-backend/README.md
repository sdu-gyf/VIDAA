VIDAA-backend

## 运行项目

### 测试环境

Windows 11 + WSL2 + Ubuntu 22.04 + Python 3.10.12

假设目前处于VIDAA-backend目录下

### 创建并激活虚拟环境

```bash
python3 -m venv vidaa
source vidaa/bin/activate
```

### 安装依赖

```bash
pip install -r requirements.txt
```

### 准备环境变量

```bash
cp .env.example .env
```
然后根据.env.example修改.env文件

### 创建SQLite

假设当前在VIDAA-backend目录下，flayway版本为11.3.3，如果版本太低会导致无法正常迁移数据库

```bash
pushd db
flyway migrate -url=jdbc:sqlite:vidaa.db -user= -password= -locations=filesystem:./migrations
popd
```

### 配置playwright

```bash
playwright install-deps
playwright install
```
安装完成之后测试playwright是否正常工作

```bash
playwright codegen --ignore-https-errors --target python -o open_baidu.py -b chromium https://www.baidu.com
```
如果一直无法发送网络请求，则需要配置代理


### 运行项目

```bash
uvicorn main:vidaa --reload
```

#!/usr/bin/env bash
set -e

echo "===== Torra-Community 环境自检与启动脚本 ====="
echo

# 1. 检测操作系统类型：windows, macos, linux
case "$(uname -s)" in
  Darwin*)    OS="macos";;
  Linux*)     OS="linux";;
  CYGWIN*|MINGW*|MSYS*) OS="windows";;
  *)          OS="unknown";;
esac

echo "检测到操作系统：$OS"
echo

# 版本检查函数：接收命令和最小主版本要求
check_version() {
  local cmd=$1
  local min_major=$2
  local ver_str=$($cmd -v 2>&1)
  local major=$(echo "$ver_str" | sed -E 's/[^0-9]*([0-9]+)\..*/\1/')
  if [[ -z "$major" || "$major" -lt "$min_major" ]]; then
    echo
    echo ">> 错误：$cmd 版本过低 (当前 ${ver_str}，需要 ≥ ${min_major})"
    exit 1
  else
    echo "✔ $cmd 版本符合要求：${ver_str}"
  fi
}

# 安装提示函数（用于缺失的 node/npm/pnpm）
install_instructions() {
  local cmd=$1
  echo
  echo ">> 未检测到：$cmd"
  echo "   安装方法："
  case "$cmd" in
    node)
      if [[ "$OS" == "macos" ]]; then
        echo "     brew install node@20"
      elif [[ "$OS" == "linux" ]]; then
        echo "     curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
        echo "     sudo apt install -y nodejs"
      elif [[ "$OS" == "windows" ]]; then
        echo "     choco install nodejs-lts --version=20.0.0"
      else
        echo "     请访问 https://nodejs.org 下载并安装 20.x LTS 版本"
      fi
      ;;
    npm)
      echo "     npm 会随 Node.js 一起安装；请先安装 Node.js"
      ;;
    pnpm)
      echo "     npm install -g pnpm"
      ;;
  esac
  echo
}

# 2. 检测 node、npm、pnpm 是否存在
for cmd in node npm pnpm; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    install_instructions "$cmd"
    exit 1
  fi
done

echo
# 3. 版本校验：node ≥20, npm ≥10, pnpm ≥10
check_version node 20
check_version npm 10
check_version pnpm 10

# 4. 可选依赖与 Nuxt4 本地 SQLite 提示

if ! command -v sqlite3 >/dev/null 2>&1; then
  echo
  echo "⚠ 警告：未检测到 sqlite3。如需本地 SQLite，请安装 sqlite3 后再运行此脚本。"
else
  echo
  echo "✔ 检测到 sqlite3。注意：Nuxt4 会在项目根目录下自动创建并使用 dev.sqlite。"
fi

if ! command -v mongod >/dev/null 2>&1; then
  echo
  echo "⚠ 警告：未检测到 MongoDB 服务端 (mongod)。如需使用 MongoDB，请安装 mongodb-community/mongodb-org 后再运行此脚本。"
fi

if ! command -v mongo >/dev/null 2>&1; then
  echo
  echo "⚠ 警告：未检测到 MongoDB 客户端 (mongo)。如需使用 mongo shell，请安装 mongodb-org-shell 后再运行此脚本。"
fi

if ! command -v mysql >/dev/null 2>&1; then
  echo
  echo "⚠ 警告：未检测到 MySQL 客户端 (mysql)。如需使用 MySQL，请安装 mysql-client 后再运行此脚本。"
fi

echo
echo "所有关键依赖及版本校验通过 ✅"
echo "开始安装项目依赖并启动 Torra-Community..."
echo

# 5. 安装依赖并启动项目
if command -v pnpm >/dev/null 2>&1; then
  pnpm install
  pnpm run dev
else
  npm install
  npm run dev
fi

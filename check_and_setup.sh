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
n  local ver_str=$($cmd -v 2>&1)
  # 提取主版本号
  local major=$(echo "$ver_str" | sed -E 's/[^0-9]*([0-9]+)\..*/\1/')
  if [[ -z "$major" || "$major" -lt "$min_major" ]]; then
    echo
    echo ">> $cmd 版本过低: 当前 ${ver_str} (需要 >= ${min_major})"
    exit 1
  else
    echo "✔ $cmd 版本符合要求: ${ver_str}"
  fi
}

# 2. 针对不同操作系统给出安装指令
install_instructions() {
  local cmd=$1
  echo
  echo ">> 检测到缺失：$cmd"
  echo "   安装方法："
  case "$cmd" in
    node)
      if [[ "$OS" == "macos" ]]; then
        echo "     brew install node@20"
      elif [[ "$OS" == "linux" ]]; then
        echo "     curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
        echo "     sudo apt install -y nodejs"   # Debian/Ubuntu
        echo "     或 sudo yum install -y nodejs   # CentOS/RedHat"
      elif [[ "$OS" == "windows" ]]; then
        echo "     choco install nodejs-lts --version=20.0.0   # 使用 Chocolatey"
        echo "     或 winget install OpenJS.NodeJS.LTS --version 20.0.0"
      else
        echo "     请访问 https://nodejs.org 下载并安装 20.x LTS 版本"
      fi
      ;;
    npm)
      echo "     npm 会随 Node.js (>20) 一起安装，确认 Node.js 安装完毕后再试。"
      ;;
    pnpm)
      echo "     npm install -g pnpm"
      ;;
    sqlite3)
      if [[ "$OS" == "macos" ]]; then
        echo "     brew install sqlite3"
      elif [[ "$OS" == "linux" ]]; then
        echo "     sudo apt update && sudo apt install -y sqlite3"
        echo "     或 sudo yum install -y sqlite"  
      elif [[ "$OS" == "windows" ]]; then
        echo "     choco install sqlite" 
        echo "     或 winget install SQLite"    
      else
        echo "     请参考 https://sqlite.org/download.html 下载并安装"
      fi
      ;;
    mongod)
      if [[ "$OS" == "macos" ]]; then
        echo "     brew tap mongodb/brew && brew install mongodb-community"
      elif [[ "$OS" == "linux" ]]; then
        echo "     请参考：https://docs.mongodb.com/manual/administration/install-on-linux/"
      elif [[ "$OS" == "windows" ]]; then
        echo "     choco install mongodb"  
        echo "     或 winget install MongoDB.Database"  
      else
        echo "     请参考 https://docs.mongodb.com/manual/installation/ 进行安装"
      fi
      ;;
    mongo)
      echo "     mongo 客户端通常与 mongod 一起安装；确保 mongod 已安装后再试。"
      ;;
    mysql)
      if [[ "$OS" == "macos" ]]; then
        echo "     brew install mysql"
      elif [[ "$OS" == "linux" ]]; then
        echo "     sudo apt update && sudo apt install -y mysql-server mysql-client"
        echo "     或 sudo yum install -y mysql-server mysql"  
      elif [[ "$OS" == "windows" ]]; then
        echo "     choco install mysql"  
        echo "     或 winget install MySQL.MySQLServer"  
      else
        echo "     请参考 https://dev.mysql.com/downloads/ 进行安装"
      fi
      ;;
  esac
}

# 3. 依赖检测
cmds=(node npm pnpm sqlite3 mongod mongo mysql)
missing_count=0
for cmd in "${cmds[@]}"; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    install_instructions "$cmd"
    missing_count=$((missing_count+1))
  fi
done

# 4. 处理检测结果
if [[ "$missing_count" -gt 0 ]]; then
  echo
  echo "检测到 $missing_count 个依赖缺失。请安装后重新运行脚本。"
  exit 1
fi

echo
# 5. 版本校验：node>=20, npm>10, pnpm>10
check_version node 20
check_version npm 11
# pnpm 未安装时跳过版本检查，但已经确认存在
check_version pnpm 11

echo

echo "所有依赖及版本校验通过 ✅"
echo "开始安装项目依赖并启动 Torra-Community..."
echo

if command -v pnpm >/dev/null 2>&1; then
  pnpm install
  pnpm run dev
else
  npm install
  npm run dev
fi


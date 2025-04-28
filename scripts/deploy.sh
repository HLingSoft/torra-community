#!/bin/bash

# === 配置项 ===
SERVER=root@139.224.249.117
REMOTE_DIR=/root/workflow
APP_NAME=nuxt-app

echo "🚀 Building Nuxt 3..."
npx nuxi build

echo "📡 Syncing to remote server..."
rsync -avz --delete .output/server/ $SERVER:$REMOTE_DIR

echo "🚀 Starting app on server using PM2..."
ssh $SERVER << EOF
  cd $REMOTE_DIR
  pm2 delete $APP_NAME || true
  pm2 start index.mjs --name "$APP_NAME"
  pm2 save
EOF

echo "✅ Deploy complete!"

#!/bin/bash

# === 配置项 ===
SERVER=root@139.224.249.117
REMOTE_DIR=/root/workflow
APP_NAME=nuxt-app
SDK_PROTO_PATH=node_modules/@zilliz/milvus2-sdk-node/dist/proto

echo "🚀 Building Nuxt 3..."
npx nuxi build

echo "📦 Packaging milvus2 proto files..."
tar czf milvus-proto.tar.gz -C $SDK_PROTO_PATH .

echo "📡 Syncing server bundle..."
rsync -avz --delete .output/server/ $SERVER:$REMOTE_DIR

echo "📡 Uploading milvus2 proto files..."
rsync -avz milvus-proto.tar.gz $SERVER:$REMOTE_DIR

echo "🚀 Starting app on server using PM2..."
ssh $SERVER << EOF
  cd $REMOTE_DIR

  echo "📂 Unpacking proto files..."
  mkdir -p node_modules/@zilliz/milvus2-sdk-node/dist/proto
  tar xzf milvus-proto.tar.gz -C node_modules/@zilliz/milvus2-sdk-node/dist/proto

  echo "🧹 Cleaning up proto archive..."
  rm -f milvus-proto.tar.gz

  echo "🚀 Restarting PM2..."
  pm2 delete $APP_NAME || true
  pm2 start index.mjs --name "$APP_NAME"
  pm2 save
EOF

echo "✅ Deploy complete!"

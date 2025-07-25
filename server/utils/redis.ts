// /server/utils/redis.ts
import Redis from 'ioredis'

// 推荐用环境变量管理密码、地址
const REDIS_URL = process.env.REDIS_URL || 'redis://xxxx:6380'

// export const redisPub = new Redis(REDIS_URL)
// export const redisSub = new Redis(REDIS_URL)

export const createRedisClient = () => {
  return new Redis(REDIS_URL)
}

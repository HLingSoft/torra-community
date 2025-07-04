// /server/utils/redis.ts
import Redis from 'ioredis'

// 推荐用环境变量管理密码、地址
const REDIS_URL = process.env.REDIS_URL || 'redis://askpro_test:Tj7x@94bQw!n@r-bp1o2kdgp7brndoxmhpd.redis.rds.aliyuncs.com:6380'

// export const redisPub = new Redis(REDIS_URL)
// export const redisSub = new Redis(REDIS_URL)

export const createRedisClient = () => {
  return new Redis(REDIS_URL)
}

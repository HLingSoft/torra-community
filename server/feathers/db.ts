import knex, { Knex } from 'knex'
import type mongooseNS from 'mongoose'
import path from 'path'
type DBType = 'sqlite' | 'mysql' | 'mongo'
export const DB: DBType = (process.env.DB ?? 'sqlite') as DBType

export let sql: Knex                                   // Knex 句柄
export let mongoose: typeof mongooseNS | undefined      // Mongo 句柄

export const initDB = async () => {
    if (DB === 'mongo') {
        mongoose = (await import('mongoose')).default
        await mongoose.connect(process.env.MONGO_URL ?? 'mongodb://127.0.0.1:27017/mydb')
        console.log('🟢 Mongo connected')
        return
    }

    /* --- SQLite / MySQL --- */
    sql = knex({
        client: DB === 'mysql' ? 'mysql2' : 'better-sqlite3',
        connection: DB === 'mysql'
            ? (process.env.MYSQL_URL || {
                host: process.env.MYSQL_HOST ?? '127.0.0.1',
                user: process.env.MYSQL_USER ?? 'root',
                password: process.env.MYSQL_PW ?? '',
                database: process.env.MYSQL_DB ?? 'mydb',
            })
            : { filename: path.resolve(process.cwd(), 'dev.sqlite') },
        useNullAsDefault: true,
    })
    console.log('🟢 SQL connected')
}

export default { initDB }

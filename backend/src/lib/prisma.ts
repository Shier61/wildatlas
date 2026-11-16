import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaClient } from '../generated/prisma/client.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.resolve(__dirname, '../../dev.db')
const adapter = new PrismaLibSql({ url: `file:${dbPath}` })

export const prisma = new PrismaClient({ adapter })

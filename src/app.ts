import fastify from "fastify"
import { mealsTransactions } from "./routes/mealsTransactions"
import cookie from '@fastify/cookie'

export const app = fastify()

app.register(cookie)

app.register(mealsTransactions, {
    prefix: 'dailydiet',
})
import fastify from "fastify"
import { mealsRoutes } from "./routes/mealsRoutes"
import cookie from '@fastify/cookie'
import { userRoutes } from "./routes/userRoutes"

export const app = fastify()

app.register(cookie)

app.register(mealsRoutes, {
    prefix: 'meals',
})

app.register(userRoutes, {
    prefix: 'users'
})
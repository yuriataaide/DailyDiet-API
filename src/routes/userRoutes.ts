import { FastifyInstance, FastifyRequest } from "fastify"
import { knex } from "../database"
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { checkSessionIdExist } from "../middlewares/check-session-id-exist"
import { create } from "node:domain"


export async function userRoutes(app:FastifyInstance) {

   app.post('/', async(request, reply) => {
    const createUserBodySchema = z.object({
        name: z.string(),
        email: z.string()
    })

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
        sessionId = randomUUID()

        reply.setCookie('sessionId', sessionId, {
            path: '/',
            maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
        })
    }

    const { name, email } = createUserBodySchema.parse(request.body)

    const userByEmail = await knex('users')
        .where({ email })
        .first()

    if(userByEmail) {
        return reply.status(400).send({
            message: 'User already exist'
        })
    }

    await knex('users')
        .insert({
            id: randomUUID(),
            name,
            email,
            session_id: sessionId
        })

        return reply.status(201).send()
   })
}

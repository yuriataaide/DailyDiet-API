import { FastifyInstance, FastifyRequest } from "fastify"
import { knex } from "../database"
import { z } from 'zod'
import crypto, { randomUUID } from 'node:crypto'
import { checkSessionIdExist } from "../middlewares/check-session-id-exist"


export async function userRoutes(app:FastifyInstance) {

    app.addHook('preHandler', async (request, reply) => {
        console.log(`[${request.method}] ${request.url}`)
    })

    // List users
    app.get('/', 
        {
            preHandler: [checkSessionIdExist]
        },
        async (request, reply) => {
            const { sessionId } = request.cookies

            const users = await knex ('users')
                .where('session_id', sessionId)
                .select()

                return { users }
        })

    // List users by ID
    app.get('/:id', 
        {
            preHandler: [checkSessionIdExist]
        },
        async (request, reply) => {
            const getUserParamsSchema = z.object({
                id: z.string().uuid()
            })

            const { id } = getUserParamsSchema.parse(request.params)

            const { sessionId } = request.cookies
            
            const user = await knex('users')
                .where({
                    session_id: sessionId,
                    id
                })
                .first()

                return { user }
         })

    app.post('/', async (request, reply) => {
        const createUserBodySchema = z.object({
            name: z.string(),
            email: z.string(),
        })

        const { name, email } = 
            createUserBodySchema.parse(
                request.body
            )

        let sessionId = request.cookies.sessionId
        
        if(!sessionId) { 
            console.log('No session ID found, generating a new one')
            sessionId = randomUUID()

            reply.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 60 * 60 * 24 * 7 // 7 days
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

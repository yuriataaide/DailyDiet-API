import { FastifyInstance, FastifyRequest } from "fastify"
import { knex } from "../database"
import { z } from 'zod'
import crypto, { randomUUID } from 'node:crypto'
import { checkSessionIdExist } from "../middlewares/check-session-id-exist"
import { Params } from "knex/types/tables"




export async function mealsTransactions(app: FastifyInstance) {
    
    app.addHook('preHandler', async (request, reply) => {
        console.log(`[${request.method}] ${request.url}`)
    })

    // List meals
    app.get('/', 
    {
        preHandler: [checkSessionIdExist]
    }, 
    async (request, reply) => {
        const { sessionId } = request.cookies

        const meals = await knex('dailydiet')
            .where('session_id', sessionId)
            .select()

        return { meals }
    })

    // List meal by id
    app.get('/:id', 
    {
        preHandler: [checkSessionIdExist]
    }, 
    async (request) => {
        const getTransactionParamsSchema = z.object({
            id: z.string().uuid(),
        })

        const { id } = getTransactionParamsSchema.parse(request.params)

        const { sessionId } = request.cookies

        const meal = await knex('dailydiet')
            .where({
                session_id: sessionId,
                id
            })
            .first()

        return { meal }
    })

    // Summary of meals quantity
    app.get('/summarymeals', 
    {
        preHandler: [checkSessionIdExist]
    }, 
    async (request) => {

        const { sessionId } = request.cookies

        const summaryMealsQuantity = await knex('dailydiet')
            .where('session_id', sessionId)
            .count('name', { as: 'count' })
            .first()

        return { summaryMealsQuantity }
    })

    // Summary of the number of meals in the diet
    app.get('/summaryondiet', 
        {
            preHandler: [checkSessionIdExist]
        }, 
        async (request) => {
    
            const { sessionId } = request.cookies
    
            const summaryMealsQuantityOnDiet = await knex('dailydiet')
                .where('session_id', sessionId)
                .count('on_diet', { as: 'count' })
                .first()
    
            return { summaryMealsQuantityOnDiet }
        })

    // Summary of the number of meals outside the diet
    app.get('/summaryoffdiet', 
        {
            preHandler: [checkSessionIdExist]
        }, 
        async (request) => {
    
            const { sessionId } = request.cookies
    
            const summaryMealsQuantityOffDiet = await knex('dailydiet')
                .where('session_id', sessionId)
                .count('off_diet', { as: 'count' })
                .first()
    
            return { summaryMealsQuantityOffDiet }
        })
        
    
    app.put('/mealedit', async (request, reply) => {
        const updateMealBodySchema = z.object({
            id: z.string(),
            name: z.string(),
            description: z.string(),
            type: z.enum(['on_diet', 'off_diet'])
        })

        const { id, name, description, type } = updateMealBodySchema.parse(
            request.body
        )

        if(!id || !name || !description || !type) {
            return reply.status(400).send({
                error: `ID, name, description or type are required.`
            })
        }

        const meal = await knex ('dailydiet')
            .where('dailydiet', id)
            .first()

        if(!meal) {
            return reply.status(400).send({
                error: `Meal not found.`
            })
        }

        await knex('dailydiet')
            .update({
                name,
                description,
                type
            })

            return reply.status(200).send({
                message: 'Meal updated succesfully.'
            })

        
    })

    
    // Create meal
    app.post('/', async (request, reply) => {

        const createMealBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            type: z.enum(['on_diet', 'off_diet'])
        })

        const { name, description, type } = createMealBodySchema.parse(
            request.body
        )
        
        let sessionId = request.cookies.sessionId

        if(!sessionId) {
            console.log('No sessionId found, generating a new one')
            sessionId = randomUUID()

            reply.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 60 * 60 * 24 * 7 // 7 days
            })
        }

        await knex('dailydiet')
            .insert({
                id: randomUUID(),
                name,
                description, 
                type: type === 'off_diet' ? type : 'on_diet',
                session_id: sessionId
        })
    
        return reply.status(201).send()
    })

    app.delete('/:id', async (request: FastifyRequest<{Params: Params}>, reply) => {
        const { id } = request.params

        await knex('dailydiet')
            .delete()
            .where({id})

        return reply.status(201).send({
            message: `Meal deleted succesfully`
        })
    })
}
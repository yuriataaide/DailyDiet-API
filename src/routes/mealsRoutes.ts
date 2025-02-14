import { FastifyInstance, FastifyRequest } from "fastify"
import { knex } from "../database"
import { z } from 'zod'
import crypto, { randomUUID } from 'node:crypto'
import { checkSessionIdExist } from "../middlewares/check-session-id-exist"

export async function mealsRoutes(app: FastifyInstance) {
    
    app.addHook('preHandler', async (request, reply) => {
        console.log(`[${request.method}] ${request.url}`)
    })


    // Create meal
    app.post('/', 
        {
            preHandler: [checkSessionIdExist]
        }, 
        async (request, reply) => {

        const createMealBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            isOnDiet: z.boolean(),
            date: z.coerce.date()
        })

        const { name, description, isOnDiet, date } = createMealBodySchema.parse(
            request.body
        )

        await knex('meals')
            .insert({
                id: randomUUID(),
                name,
                description, 
                is_on_diet: isOnDiet,
                date: date.getTime(),
                user_id: request.user?.id
                
        })
    
        return reply.status(201).send()
    })

    // List meals
    app.get('/', 
    {
        preHandler: [checkSessionIdExist]
    }, 
    async (request, reply) => {
        const { sessionId } = request.cookies

        const meals = await knex('meals')
            .where({
                user_id: request.user?.id
            })
            .orderBy('date', 'desc')

        return reply.send({ meals })
    })

    // Metrics
    app.get('/metrics', 
    {
        preHandler: [checkSessionIdExist]
    }, 
    async (request, reply) => {
        const totalMealsOndiet = await knex('meals')
            .where({user_id: request.user?.id, is_on_diet: true})
            .count('id', {as: 'total'})
            .first()

        const totalMealsOffDiet = await knex('meals')
            .where({user_id: request.user?.id, is_on_diet: false})
            .count('id', {as: 'total'})
            .first()

        const totalMeals = await knex('meals')
            .where({user_id: request.user?.id})
            .orderBy('date', 'desc')

        const { bestOnDietSequence } = totalMeals.reduce(
            (acc, meal) => {
                if(meal.is_on_diet) {
                    acc.currentSequence += 1
                } else {
                    acc.currentSequence = 0
                }

                if(acc.currentSequence > acc.bestOnDietSequence) {
                    acc.bestOnDietSequence = acc.currentSequence
                }

                return (acc)
            },

            { bestOnDietSequence: 0, currentSequence: 0 },
        )

        return reply.send({
            totalMeals: totalMeals.length,
            totalMealsOndiet: totalMealsOndiet?.total,
            totalMealsOffDiet: totalMealsOffDiet?.total,
            bestOnDietSequence,
        })
    
    })


    // Update Meal
    app.put('/mealId', 
        {
            preHandler: [checkSessionIdExist]
        }, 
        async (request, reply) => {
        const paramsSchema = z.object({
            mealId: z.string().uuid()
        })

        const { mealId } = paramsSchema.parse(request.params)

        const updateMealBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            isOnDiet: z.boolean(),
            date: z.coerce.date(),
        })

        const { name, description, isOnDiet, date } = updateMealBodySchema.parse(
            request.body
        )

        console.log(request.body)

        if( !name || !description || !isOnDiet || !date) {
            return reply.status(400).send({
                error: `ID, name, description, isOnDiet or date are required.`
            })
        }

        const meal = await knex ('meals')
            .where({id: mealId})
            .first()

        if(!meal) {
            return reply.status(400).send({
                error: `Meal not found.`
            })
        }

        await knex('meals')
            .update({
                name,
                description,
                is_on_diet: isOnDiet,
                date: date.getTime()
            })
            .where({id: mealId})

            return reply.status(204).send({
                message: 'Meal updated successfully.'
            })

        
    })

    // Delete Meal
    app.delete('/:mealId', 
        {
            preHandler: [checkSessionIdExist]
        }, 
        async (request, reply) => {
        const paramsSchema = z.object({
            mealId: z.string().uuid(),
        })

        console.log(request.params)

        const { mealId } = paramsSchema.parse(request.params)

        const result = await knex('dailydiet')
            .delete()
            .where({id: mealId})

        if(result === 0) {
            return reply.status(400).send({
                message: `Meal not found.`
            })
        }
        
        return reply.status(201).send({
            message: `Meal deleted succesfully`
        })
    })
}
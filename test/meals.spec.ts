import { it, expect, beforeAll, afterAll, describe, beforeEach } from 'vitest'
import { exec, execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'


describe('Diet routes', () => {
    beforeAll(async () => {
        await app.ready()
    })
    
    afterAll(async () => {
        await app.close()
    })
    
    beforeEach(() => {
        execSync('npm run knex -- migrate:rollback --all')
        execSync('npm run knex -- migrate:latest')
    })

    it('should be able to create a meal', async () => {
        const userResponse = await request(app.server)
            .post('/users')
            .send({
                name: 'Clarice',
                email: 'clarice@email.com'
            })
            .expect(201)


        await request(app.server)
            .post('/meals')
            .send({
                name: 'X-Tudo',
                description: 'X-Tudo completo',
                isOnDiet: false,
                date: new Date()
            })
            .set('Cookie', userResponse.get('Set-Cookie'))
            .expect(201)
    })

    it('should be able to list all meals', async () => {
        const userResponse = await request(app.server) 
            .post('/users')
            .send({
                name: 'Clarice',
                email: 'clarice@email.com'
            })
            .expect(201)
        
        await request(app.server)
            .post('/meals')
            .set('Cookie', userResponse.get('Set-Cookie'))
            .send({
                name: 'Café da manhã',
                description: 'Café da manhã completo',
                isOnDiet: true,
                date: new Date()
            })
            .expect(201)

        const mealResponse = await request(app.server)
            .get('/meals')
            .set('Cookie', userResponse.get('Set-Cookie'))
            .expect(200)

        expect(mealResponse.body.meals)

        expect(mealResponse.body.meals[0].name).toBe('Café da manhã')
    })

    it('should be able to list a single meal', async() => {
        const userResponse = await request(app.server) 
            .post('/users')
            .send({
                name: 'Clarice',
                email: 'clarice@email.com'
            })
            .expect(201)
        
        await request(app.server)
            .post('/meals')
            .set('Cookie', userResponse.get('Set-Cookie'))
            .send({
                name: 'Café da manhã',
                description: 'Café da manhã completo',
                isOnDiet: true,
                date: new Date()
            })
            .expect(201)

        const mealsResponse = await request(app.server)
            .get('/meals')
            .set('Cookie', userResponse.get('Set-Cookie'))
            .expect(200)

        const mealId = mealsResponse.body.meals[0].id

        const mealResponse = await request(app.server)
            .get(`/meals/${mealId}`)
            .set('Cookie', userResponse.get('Set-Cookie'))
            .expect(200)

        expect(mealResponse.body).toEqual({
            meal: expect.objectContaining({
                name: 'Café da manhã',
                description: 'Café da manhã completo',
                is_on_diet: 1,
                date: expect.any(Number)
            })
        })
    })

    it('should be able to delete a meal from user', async () => {
        const userResponse = await request(app.server) 
            .post('/users')
            .send({
                name: 'Clarice',
                email: 'clarice@email.com'
            })
            .expect(201)
        
        await request(app.server)
            .post('/meals')
            .set('Cookie', userResponse.get('Set-Cookie'))
            .send({
                name: 'Café da manhã',
                description: 'Café da manhã completo',
                isOnDiet: true,
                date: new Date()
            })
            .expect(201)

        const mealsResponse = await request(app.server)
            .get('/meals')
            .set('Cookie', userResponse.get('Set-Cookie'))
            .expect(200)

        const mealId = mealsResponse.body.meals[0].id

        await request(app.server)
            .delete(`/meals/${mealId}`)
            .set('Cookie', userResponse.get('Set-Cookie'))
            .expect(204)
    })

    it('should be able to update a meal from user', async () => {
        const userResponse = await request(app.server) 
            .post('/users')
            .send({
                name: 'Clarice',
                email: 'clarice@email.com'
            })
            .expect(201)
        
        await request(app.server)
            .post('/meals')
            .set('Cookie', userResponse.get('Set-Cookie'))
            .send({
                name: 'Café da manhã',
                description: 'Café da manhã completo',
                isOnDiet: true,
                date: new Date()
            })
            .expect(201)

        const mealsResponse = await request(app.server)
            .get('/meals')
            .set('Cookie', userResponse.get('Set-Cookie'))
            .expect(200)

        const mealId = mealsResponse.body.meals[0].id

        await request(app.server)
            .put(`/meals/${mealId}`)
            .set('Cookie', userResponse.get('Set-Cookie'))
            .send({
                name: 'Janta',
                description: 'Janta com arroz, feijão e bife de carne',
                isOnDiet: true,
                date: new Date()
            })
            .expect(204)
    })

    it('should be abe to get a metrics from a user', async() => {
        const userResponse = await request(app.server)
            .post('/users')
            .send({
                name: 'Clarice',
                email: 'clarice@email.com'
            })
            .expect(201)

        await request(app.server)
            .post('/meals')
            .set('Cookie', userResponse.get('Set-Cookie'))
            .send({
                name: 'Café da manhã',
                description: 'Café da manhã completo',
                isOnDiet: true,
                date: new Date()
            })
            .expect(201)

        await request(app.server)
            .post('/meals')
            .set('Cookie', userResponse.get('Set-Cookie'))
            .send({
                name: 'Janta',
                description: 'Janta completa',
                isOnDiet: true,
                date: new Date()
            })
            .expect(201)

        await request(app.server)
            .post('/meals')
            .set('Cookie', userResponse.get('Set-Cookie'))
            .send({
                name: 'X-Tudo',
                description: 'X-Tudo completo',
                isOnDiet: false,
                date: new Date()
            })
            .expect(201)

        await request(app.server)
            .post('/meals')
            .set('Cookie', userResponse.get('Set-Cookie'))
            .send({
                name: 'Sorvete de baunilha',
                description: 'Casquinha de sorvete McDonalds',
                isOnDiet: false,
                date: new Date()
            })
            .expect(201)   
        
        await request(app.server)
            .post('/meals')
            .set('Cookie', userResponse.get('Set-Cookie'))
            .send({
                name: 'Balde de salada',
                description: 'Salada completa feita em casa',
                isOnDiet: true,
                date: new Date()
            })
            .expect(201)

        const metricsResponse = await request(app.server)
            .get('/meals/metrics')
            .set('Cookie', userResponse.get('Set-Cookie'))
            .expect(200)

        expect(metricsResponse.body).toEqual({
            totalMeals: 5,
            totalMealsOnDiet: 3,
            totalMealsOffDiet: 2,
            bestOnDietSequence: 2
        })
    })
})
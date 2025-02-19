import { it, expect, beforeAll, afterAll, describe, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
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
     
    it('should be able to create a new user', async () => {
        const user = await request(app.server)
            .post('/users')
            .send({
                name: 'Clarice',
                email: 'clarice@email.com'
            })
            .expect(201)

        const cookies = user.get('Set-Cookie')

        expect(cookies).toEqual(
            expect.arrayContaining([expect.stringContaining('sessionId')])
        )
    })

})
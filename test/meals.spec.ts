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
        execSync('npx knex -- migrate:rollback --all')
        execSync('npx knex -- migrate:latest')
    })
})
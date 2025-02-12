import { Knex } from 'knex'

declare module 'knex/types/tables' {
    export interface Tables {
        dailydiet: {
            id: string
            name: string
            description: string
            type: string
            created_at: string
            session_id?: string
        }
    }
}
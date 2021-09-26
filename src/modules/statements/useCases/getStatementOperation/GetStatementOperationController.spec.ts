import { hash } from 'bcrypt'
import request from 'supertest'
import { Connection } from 'typeorm'
import { v4 as uuid } from 'uuid';

import { app } from '../../../../app'
import createConnection from '../../../../database'

let connection: Connection
describe('Get Statement Operation Controller', () => {
  beforeAll(async () => {
    connection = await createConnection()
    await connection.runMigrations()

    const id = uuid();
    const password = await hash('admin', 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password)
      VALUES('${id}', 'usertest', 'user@test.com.br', '${password}')`
    );
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it('should be able to get a statement', async () => {
    const { body: { token } } = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'user@test.com.br',
        password: 'admin',
      })

    const { body: { id: statement_id } } = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        description: 'Deposit Description',
        amount: 100,
      })
      .set({
        Authorization: `Bearer ${token}`,
      })

    const { status, body } = await request(app)
      .get(`/api/v1/statements/${statement_id}`)
      .set({
        Authorization: `Bearer ${token}`,
      })

    expect(body).toHaveProperty('id')
    expect(body).toHaveProperty('user_id')
    expect(body.type).toEqual('deposit')
    expect(body.amount).toBe('100.00')
    expect(body.description).toBe('Deposit Description')
    expect(status).toBe(200)
  })

  it('should not be able to get a non-existing statement', async () => {
    const { body: { token } } = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'user@test.com.br',
        password: 'admin',
      })

    const { status } = await request(app)
      .get(`/api/v1/statements/${uuid()}`)
      .set({
        Authorization: `Bearer ${token}`,
      })

    expect(status).toBe(404)
  })

  it('should not be able to get a balance with statement list without a valid token', async () => {
    const { body: { token } } = await request(app)
      .post('/api/v1/sessions').send({
        email: 'user@test.com.br',
        password: 'admin',
      })

    const { body: { id: statement_id } } = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        description: 'Deposit Description',
        amount: 100,
      })
      .set({
        Authorization: `Bearer ${token}`,
      })

    const { status } = await request(app)
      .get(`/api/v1/statements/${statement_id}`)
      .set({
        Authorization: `Bearer invalid_token`,
      })

    expect(status).toBe(401)
  })
})

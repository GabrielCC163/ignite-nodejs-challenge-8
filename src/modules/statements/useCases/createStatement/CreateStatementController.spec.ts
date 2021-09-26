import { hash } from 'bcrypt'
import request from 'supertest'
import { Connection } from 'typeorm'
import { v4 as uuid } from 'uuid';

import { app } from '../../../../app'
import createConnection from '../../../../database'

let connection: Connection
describe('Create Statement Controller', () => {
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

  it('should be able to create a new deposit', async () => {
    const { body: { token } } = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'user@test.com.br',
        password: 'admin',
      })

    const { status, body } = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        description: 'Deposit Description',
        amount: 100,
      })
      .set({
        Authorization: `Bearer ${token}`,
      })

    expect(body).toHaveProperty('id')
    expect(body).toHaveProperty('user_id')
    expect(body.type).toEqual('deposit')
    expect(body.amount).toBe(100)
    expect(body.description).toBe('Deposit Description')
    expect(status).toBe(201)
  })

  it('should not be able to create a new deposit statement without a valid token', async () => {
    const { status } = await request(app)
      .post('/api/v1/statements/deposit')
      .set({
        Authorization: `Bearer invalid_token`,
      })

    expect(status).toBe(401)
  })

  it('should not be able to create a new withdraw statement without a valid token', async () => {
    const { status } = await request(app)
      .post('/api/v1/statements/withdraw')
      .set({
        Authorization: `Bearer invalid_token`,
      })

    expect(status).toBe(401)
  })

  it('should not be able to create a withdraw statement with insufficient funds', async () => {
    const {
      body: { token },
    } = await request(app).post('/api/v1/sessions').send({
      email: 'user@test.com.br',
      password: 'admin',
    })

    const { status, body } = await request(app)
      .post('/api/v1/statements/withdraw')
      .send({
        description: 'Withdraw Statement Supertest Description',
        amount: 999,
      })
      .set({
        Authorization: `Bearer ${token}`,
      })

    expect(status).toBe(400)
    expect(body.message).toBe('Insufficient funds')
  })
})

import { hash } from 'bcrypt'
import request from 'supertest'
import { Connection } from 'typeorm'
import { v4 as uuid } from 'uuid';

import { app } from '../../../../app'
import createConnection from '../../../../database'

let connection: Connection
describe('Authenticate User Controller', () => {
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

  it('should be able to authenticate a user', async () => {
    const { body, status } = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'user@test.com.br',
        password: 'admin',
      })

    const { token, user } = body

    expect(body).toHaveProperty('token')
    expect(body).toEqual({
      token,
      user: {
        ...user,
        name: 'usertest',
        email: 'user@test.com.br',
      },
    })
    expect(status).toBe(200)
  })

  it('should not be able to authenticate a user with incorrect email', async () => {
    const { status } = await request(app).post('/api/v1/sessions').send({
      email: 'nonexistinguseremail@testexample.com',
      password: 'admin',
    })
    expect(status).toBe(401)
  })

  it('should not be able to authenticate a user with incorrect password', async () => {
    const { status } = await request(app).post('/api/v1/sessions').send({
      email: 'user@test.com.br',
      password: 'incorrect_password',
    })
    expect(status).toBe(401)
  })
})

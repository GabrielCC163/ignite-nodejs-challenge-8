import { AppError } from '../../../../shared/errors/AppError'
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository'
import { CreateUserUseCase } from './CreateUserUseCase'

let inMemoryUsersRepository: InMemoryUsersRepository
let createUserUseCase: CreateUserUseCase

describe('Authenticate User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
  })

  it('should be able to create a new user', async () => {
    const user = {
      name: 'User Test',
      email: 'user@test.com',
      password: 'password',
    }

    const response = await createUserUseCase.execute(user)

    expect(response).toHaveProperty('id')
  })

  it('should not be able to create a new user with existing email', async () => {
    const user1 = {
      name: 'User1 Test',
      email: 'user1@test.com',
      password: 'password',
    }

    const user2 = {
      name: 'User2 Test',
      email: 'user1@test.com',
      password: 'password',
    }

    await createUserUseCase.execute(user1)

    await expect(
      createUserUseCase.execute(user2)
    ).rejects.toEqual(new AppError('User already exists'))
  })
})

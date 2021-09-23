import { AppError } from '../../../../shared/errors/AppError'
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository'
import { CreateUserUseCase } from '../createUser/CreateUserUseCase'
import { AuthenticateUserUseCase } from './AuthenticateUserUseCase'

let authenticateUserUseCase: AuthenticateUserUseCase
let inMemoryUsersRepository: InMemoryUsersRepository
let createUserUseCase: CreateUserUseCase

describe('Authenticate User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    )
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
  })

  it('should not be able to authenticate a user with incorrect email', async () => {
    const createdUser = {
      name: 'User Test',
      email: 'user@test.com',
      password: 'correct_password',
    }

    await createUserUseCase.execute(createdUser)

    await expect(
      authenticateUserUseCase.execute({
        email: 'incorrectuseremail@test.com',
        password: createdUser.password,
      })
    ).rejects.toEqual(new AppError('Incorrect email or password', 401))
  })

  it('should not be able to authenticate a user with incorrect password', async () => {
    const createdUser = {
      name: 'User Test',
      email: 'user@test.com',
      password: 'correct_password',
    }

    await createUserUseCase.execute(createdUser)

    await expect(
      authenticateUserUseCase.execute({
        email: createdUser.email,
        password: 'incorrect_password',
      })
    ).rejects.toEqual(new AppError('Incorrect email or password', 401))
  })

  it('should be able to authenticate an user', async () => {
    const createdUser = {
      name: 'User Test',
      email: 'user@test.com',
      password: 'correct_password',
    }

    const { email } = await createUserUseCase.execute(createdUser)

    const authenticatedUser = await authenticateUserUseCase.execute({
      email,
      password: createdUser.password,
    })
    expect(authenticatedUser).toHaveProperty('token')
  })
})

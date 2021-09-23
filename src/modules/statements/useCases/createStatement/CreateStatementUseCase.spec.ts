import { OperationType } from '@modules/statements/entities/Statement'
import { AppError } from '../../../../shared/errors/AppError'
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository'
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository'
import { CreateStatementUseCase } from './CreateStatementUseCase'

let createStatementUseCase: CreateStatementUseCase
let inMemoryStatementsRepository: InMemoryStatementsRepository
let inMemoryUsersRepository: InMemoryUsersRepository

describe('Create Statement', () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    )
  })

  it('should not be able to create a new withdraw without funds', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'User Test',
      email: 'user@test.com',
      password: 'password',
    })

    const deposit = {
      user_id: user.id,
      amount: 100,
      description: 'Description Test',
      type: OperationType.DEPOSIT,
    }

    const withdraw = {
      user_id: user.id,
      type: OperationType.WITHDRAW,
      amount: 110,
      description: 'Description Test',
    }

    await createStatementUseCase.execute(deposit);

    await expect(
      createStatementUseCase.execute(withdraw)
    ).rejects.toEqual(new AppError('Insufficient funds', 400))
  })

  it('should not be able to create a new statement when user does not exist', async () => {
    const deposit = {
      user_id: 'invalid_user_id',
      type: OperationType.DEPOSIT,
      amount: 99,
      description: 'Description Test',
    }

    await expect(
      createStatementUseCase.execute(deposit)
    ).rejects.toEqual(new AppError('User not found', 404))
  })

  it('should be able to create a new withdraw with funds', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'User Test',
      email: 'user@test.com',
      password: 'password',
    })

    const deposit = {
      user_id: user.id,
      type: OperationType.DEPOSIT,
      amount: 99,
      description: 'Statement Description Test',
    }
    const withdraw = {
      user_id: user.id,
      type: OperationType.WITHDRAW,
      amount: 90,
      description: 'Statement Description Test',
    }

    await createStatementUseCase.execute(deposit)
    const withdrawStatementCreated = await createStatementUseCase.execute(
      withdraw
    )

    expect(withdrawStatementCreated).toHaveProperty('id')
  })

  it('should be able to create a new deposit', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'Test',
      email: 'user@test.com',
      password: 'password',
    })

    const deposit = {
      user_id: user.id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'Description Test',
    }

    const depositStatementCreated = await createStatementUseCase.execute(
      deposit
    )

    expect(depositStatementCreated).toHaveProperty('id')
  })
})

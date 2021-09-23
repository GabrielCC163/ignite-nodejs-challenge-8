import { OperationType } from '@modules/statements/entities/Statement'
import { AppError } from '../../../../shared/errors/AppError'
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository'
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository'
import { GetBalanceUseCase } from './GetBalanceUseCase'

let getBalanceUseCase: GetBalanceUseCase
let inMemoryStatementsRepository: InMemoryStatementsRepository
let inMemoryUsersRepository: InMemoryUsersRepository

describe('Create Statement', () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    inMemoryUsersRepository = new InMemoryUsersRepository()
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    )
  })

  it('should be able to get the balance with statement list', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'User Test',
      email: 'user@test.com',
      password: 'password',
    })

    const deposit = await inMemoryStatementsRepository.create({
      user_id: user.id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'Description Test',
    })

    const withdraw = await inMemoryStatementsRepository.create({
      user_id: user.id,
      type: OperationType.WITHDRAW,
      amount: 70,
      description: 'Description Test',
    })

    const getBalance = await getBalanceUseCase.execute({
      user_id: user.id,
    })

    expect(getBalance).toHaveProperty('balance')

    expect(getBalance.balance).toBe(
      deposit.amount - withdraw.amount
    )

    expect(getBalance.statement).toEqual([
      deposit,
      withdraw,
    ])

    expect(getBalance).toEqual({
      balance: deposit.amount - withdraw.amount,
      statement: [deposit, withdraw],
    })
  })

  it('should not be able to get the balance with invalid user', async () => {
    await expect(
      getBalanceUseCase.execute({ user_id: 'invalid_user_id' })
    ).rejects.toEqual(new AppError('User not found', 404))
  })
})

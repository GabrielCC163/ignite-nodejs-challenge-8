import { OperationType } from '@modules/statements/entities/Statement'
import { AppError } from '../../../../shared/errors/AppError'
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository'
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository'
import { GetStatementOperationUseCase } from './GetStatementOperationUseCase'

let getStatementOperationUseCase: GetStatementOperationUseCase
let inMemoryStatementsRepository: InMemoryStatementsRepository
let inMemoryUsersRepository: InMemoryUsersRepository

describe('Create Statement', () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    inMemoryUsersRepository = new InMemoryUsersRepository()
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    )
  })

  it('should not be able to get a non-existing statement', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'User Test',
      email: 'user@test.com',
      password: 'password',
    })

    await expect(
      getStatementOperationUseCase.execute({
        user_id: user.id,
        statement_id: 'invalid_statement_id',
      })
    ).rejects.toEqual(new AppError('Statement not found', 404))
  })

  it('should not be able to get a statement whit a non-existing user', async () => {
    await expect(
      getStatementOperationUseCase.execute({
        user_id: 'invalid_user_id',
        statement_id: 'invalid_statement_id',
      })
    ).rejects.toEqual(new AppError('User not found', 404))
  })

  it('should be able to get a statement operation', async () => {
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

    const getStatementOperation = await getStatementOperationUseCase.execute({
      user_id: user.id,
      statement_id: deposit.id,
    })

    expect(getStatementOperation).toHaveProperty('id')
    expect(getStatementOperation).toEqual(deposit)
  })
})

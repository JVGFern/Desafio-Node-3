import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome' && value > balance.total) {
      throw new AppError('Invalid balance with type outcome', 400);
    }

    const checkCategoryExists = await categoryRepository.findOne({
      where: { title: category },
    });

    let titleCategory = '';
    if (!checkCategoryExists) {
      const saveCategory = categoryRepository.create({ title: category });
      const categorySaved = await categoryRepository.save(saveCategory);
      titleCategory = categorySaved.id;
    } else {
      titleCategory = checkCategoryExists.id;
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: titleCategory,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;

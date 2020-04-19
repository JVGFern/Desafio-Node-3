import { Router } from 'express';
import { getCustomRepository, getRepository } from 'typeorm';
import multer from 'multer';
import path from 'path';

import uploadConfig from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import Category from '../models/Category';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (req, res) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionsRepository.find();
  const balance = await transactionsRepository.getBalance();
  const categories = getRepository(Category);

  const category = await categories.find();
  const transaction = {
    transactions,
    balance,
    category,
  };

  return res.json(transaction);
});

transactionsRouter.post('/', async (req, res) => {
  const { title, value, type, category } = req.body;
  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });
  return res.json(transaction);
});

transactionsRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute({ id });

  res.status(204).send();
});

transactionsRouter.post('/import', upload.single('file'), async (req, res) => {
  const importFile = path.join(uploadConfig.directory, req.file.filename);

  const importTransactionsService = new ImportTransactionsService();

  const transactions = await importTransactionsService.execute({
    importFile,
  });

  return res.json(transactions);
});

export default transactionsRouter;

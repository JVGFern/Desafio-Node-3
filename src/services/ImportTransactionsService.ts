import csvtojson from 'csvtojson';
import fs from 'fs';

import Transaction from '../models/Transaction';

import CreateTransactionService from './CreateTransactionService';

interface Request {
  importFile: string;
}

class ImportTransactionsService {
  public async execute({ importFile }: Request): Promise<Transaction[]> {
    const data = await csvtojson().fromFile(importFile);

    const transactions: Transaction[] = [];

    const createTransactionService = new CreateTransactionService();

    for (const transactionArray of data) {
      const transaction = await createTransactionService.execute(
        transactionArray,
      );

      transactions.push(transaction);
    }

    await fs.promises.unlink(importFile);

    return transactions;
  }
}

export default ImportTransactionsService;

import Dexie, { Table } from 'dexie';
import {
  Income,
  Expense,
  Transaction,
  Asset,
  Liability,
  Account,
  ImportTemplate,
} from '@/types/models';

export class FinDB extends Dexie {
  incomes!: Table<Income, string>;
  expenses!: Table<Expense, string>;
  transactions!: Table<Transaction, string>;
  assets!: Table<Asset, string>;
  liabilities!: Table<Liability, string>;
  accounts!: Table<Account, string>;
  importTemplates!: Table<ImportTemplate, string>;

  constructor() {
    super('fin-db');
    this.version(1).stores({
      incomes: 'id, name, category, isActive, startDate, endDate',
      expenses: 'id, name, category, isActive, dueDate',
      transactions: 'id, date, type, category, account, importBatchId',
      assets: 'id, type, valuationDate',
      liabilities: 'id, type',
      accounts: 'id, type, institution',
      importTemplates: 'id, name, fileType',
    });
  }
}

export const db = new FinDB();

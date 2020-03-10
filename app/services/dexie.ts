/* eslint-disable @typescript-eslint/promise-function-async,@typescript-eslint/no-misused-promises */

// Vendor
import Service from '@ember/service';
import Dexie from 'dexie';

type TableName = 'bookmarkTrades' | 'bookmarkFolders';

export default class DexieService extends Service {
  private db: Dexie;

  initialize() {
    this.db = new Dexie('PoeBetterTrading');

    this.db.version(1).stores({
      bookmarkFolders: '++id,title,icon,rank',
      bookmarkTrades: '++id,title,rank,folderId'
    });

    this.db
      .version(2)
      .stores({
        bookmarkTrades: '++id,title,rank,folderId,completedAt'
      })
      .upgrade((transaction: Dexie.Transaction) => {
        return transaction
          .table('bookmarkTrades')
          .toCollection()
          .modify(bookmarkTrade => {
            bookmarkTrade.completedAt = null;
          });
      });
  }

  async fetch<T>(table: TableName, id: number): Promise<T | null> {
    return new Promise((resolve, _reject) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.db
        .table(table)
        .get(id)
        .then((result?: T) => resolve(result || null));
    });
  }

  async fetchAll<T>(table: TableName): Promise<T[]> {
    return new Promise((resolve, _reject) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.db
        .table(table)
        .toArray()
        .then((results: T[]) => resolve(results));
    });
  }

  async searchQuery<T>(table: TableName, key: string, value: any): Promise<T[]> {
    return new Promise((resolve, _reject) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.db
        .table(table)
        .where(key)
        .equals(value)
        .toArray()
        .then((results: T[]) => resolve(results));
    });
  }

  async upsert<T>(table: TableName, record: T): Promise<number> {
    return new Promise((resolve, _reject) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.db
        .table(table)
        .put(record)
        .then(id => resolve(id));
    });
  }

  async batchUpsert<T>(table: TableName, records: T[]): Promise<void> {
    return new Promise((resolve, _reject) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.db
        .table(table)
        .bulkPut(records)
        .then(() => resolve());
    });
  }

  async delete(table: TableName, key: number): Promise<void> {
    return new Promise((resolve, _reject) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.db
        .table(table)
        .delete(key)
        .then(() => resolve());
    });
  }

  async deleteQuery(table: TableName, key: string, value: any): Promise<void> {
    return new Promise((resolve, _reject) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.db
        .table(table)
        .where(key)
        .equals(value)
        .delete()
        .then(() => resolve());
    });
  }
}

declare module '@ember/service' {
  interface Registry {
    dexie: DexieService;
  }
}

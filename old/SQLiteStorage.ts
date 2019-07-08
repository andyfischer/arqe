
import SQLite from 'sqlite3'
import Path from 'path'

const Filename = Path.join(__dirname, '../db.sqlite3');

class SQLiteStorage {
    db: any

    constructor() {
        this.db = new SQLite.Database(Filename, SQLite.OPEN_READWRITE);
    }
}

export async function createNewDatabase() {
    const db = new SQLite.Database(Filename);

    await new Promise(resolve => {
        db.run(`create table slots(...`);
    });
}

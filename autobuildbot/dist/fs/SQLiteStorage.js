"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const Filename = path_1.default.join(__dirname, '../db.sqlite3');
class SQLiteStorage {
    constructor() {
        this.db = new sqlite3_1.default.Database(Filename, sqlite3_1.default.OPEN_READWRITE);
    }
}
async function createNewDatabase() {
    const db = new sqlite3_1.default.Database(Filename);
    await new Promise(resolve => {
        db.run(`create table slots(...`);
    });
}
exports.createNewDatabase = createNewDatabase;
//# sourceMappingURL=SQLiteStorage.js.map
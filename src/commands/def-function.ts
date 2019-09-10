
import { implement, Query } from '..'
import { declareReducer } from '../framework'
import { print } from '../utils'

interface Database {
    byName: { [name: string]: Function }
}

interface Function {
    name: string
}

implement('def-function', async (query: Query) => {
    const name = query.args[0];
    query.snapshot.modifyGlobal('functionDatabase', (db: Database) => {
        if (!db) {
            db = {
                byName: {}
            }
        }

        if (db.byName[name]) {
            print('warning: function already defined: ' + name);
            return db;
        }

        db.byName[name] = {
            name
        }

        return db;
    });
});


import { print } from '../utils'
import { implement, Query } from '..'
import { Snapshot } from '../framework'

interface Database {
    byName: { [name: string]: Type }
}

interface Type {
    name: string
}

export default function(snapsho: Snapshot) {
    implement('def-type', async (query: Query) => {
        const name = query.args[0];
        query.snapshot.modifyGlobal('typeDatabase', (db: Database) => {
            if (!db) {
                db = {
                    byName: {}
                };
            }

            if (db.byName[name]) {
                print('warning: type already defined: ' + name);
                return db;
            }

            db.byName[name] = {
                name
            }

            return db;
        });
    });
}

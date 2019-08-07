
import { Query } from '..'
import { declareReducer } from '../framework'
import { print } from '../utils'

interface Database {
    byName: { [name: string]: Type }
}

interface Type {
    name: string
}

function update(query: Query, db: Database) {
    if (query.command === 'def-type') {
        const name = query.commandArgs[0];
        if (db.byName[name]) {
            print('warning: type already defined: ' + name);
            return;
        }

        db.byName[name] = {
            name
        }

        return;
    }
}

declareReducer(() => {
    return {
        name: 'types',
        value: {
            byName: {}
        },
        spamsChangeLog: true,
        reducer(query: Query, value: Database) {
            update(query, value);
            return value;
        }
    }
});

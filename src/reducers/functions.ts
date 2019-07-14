
import { Query } from '../query'
import { declareReducer } from '../framework'
import { print } from '../utils'

interface Database {
    byName: { [name: string]: Function }
}

interface Function {
    name: string
}

function update(query: Query, db: Database) {
    if (query.command === 'def-function') {
        const name = query.commandArgs[0];
        if (db.byName[name]) {
            print('warning: function already defined: ' + name);
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

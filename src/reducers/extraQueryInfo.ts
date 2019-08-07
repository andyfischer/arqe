
import { Query } from '..'
import { declareReducer } from '../framework'
import { print } from '../utils'

declareReducer(() => {
    return {
        name: 'extraQueryInfo',
        value: { },
        reducer(query: Query, value) {
            if (query.isInteractive) {
                const q = Object.assign({}, query);
                delete q.syntax;
                delete q.snapshot;
                delete q.isInteractive;
                // print('note: parsed as: ' + JSON.stringify(q));
            }
        }
    }
});

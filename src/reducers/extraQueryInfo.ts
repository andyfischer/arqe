
import { Query } from '../query'
import { declareReducer } from '../framework'
import { print } from '../utils'

declareReducer(() => {
    return {
        name: 'extraQueryInfo',
        value: { },
        reducer(query: Query, value) {
            const q = Object.assign({}, query);
            delete q.syntax;
            delete q.snapshot;
            print('note: parsed as ' + JSON.stringify(q));
        }
    }
});

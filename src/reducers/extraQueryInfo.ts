
import { Query } from '../query'
import { declareReducer } from '../framework'
import { print } from '../utils'

declareReducer(() => {
    return {
        name: 'extraQueryInfo',
        value: { },
        reducer(query: Query, value) {
            print('note: parsed as ' + JSON.stringify(query));
        }
    }
});

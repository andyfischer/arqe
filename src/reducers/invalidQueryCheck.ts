
import { Query } from '../query'
import { declareReducer } from '../framework'
import { print } from '../utils'

declareReducer(() => {
    return {
        name: 'invalidQueryCheck',
        value: null,
        reducer(query: Query, value) {
            if (query.type === 'unknown')
                print('warning: unrecogized query: ' + query.syntax.originalStr);
        }
    }
})


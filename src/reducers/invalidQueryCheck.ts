
import { Query } from '..'
import { declareReducer } from '../framework'
import { print } from '../utils'
import { sourcePosToString } from '../types/SourcePos'

declareReducer(() => {
    return {
        name: 'invalidQueryCheck',
        value: null,
        reducer(query: Query, value) {
            if (query.type === 'unknown') {
                print(JSON.stringify(query.syntax))
                print(`warning: unrecognized query: '${query.syntax.originalStr}'`
                      + (query.syntax.sourcePos ?
                          ` (from ${sourcePosToString(query.syntax.sourcePos)})` : ''))
            }
        }
    }
})


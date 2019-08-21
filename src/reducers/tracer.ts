

import { Query } from '..'
import { declareReducer } from '../framework'
import { print } from '../utils'
import { sourcePosToString } from '../types/SourcePos'

declareReducer(() => {
    return {
        name: 'tracer',
        value: {},
        reducer(query: Query, value) {
            /*
            print(`saw query: '${query.syntax.originalStr}'`)
            print(`from: ${sourcePosToString(query.syntax.sourcePos)}`)
            */
        }
    }
});

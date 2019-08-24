
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
                let msg = `warning: unrecognized query: '${query.syntax.originalStr}'`;

                if (query.syntax.sourcePos && query.syntax.sourcePos.filename)
                    msg += ` (from ${sourcePosToString(query.syntax.sourcePos)})`;

                print(msg);
            }
        }
    }
})


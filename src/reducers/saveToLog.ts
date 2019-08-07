
import { declareReducer, Query } from '..'
import { appendToCommandLog } from '../storage'

declareReducer(() => {
    return {
        name: 'saveToLog',
        value: { },
        async reducer(query: Query, value) {
            if (query.type === 'relation' && query.isInteractive) {
                appendToCommandLog(query.syntax.originalStr);
            }
        }
    }
});

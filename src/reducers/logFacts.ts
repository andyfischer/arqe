
import { declareReducer, Query } from '..'
import { appendToLog } from '../storage'

declareReducer(() => {
    return {
        name: 'logFacts',
        value: { },
        async reducer(query: Query, value) {
            if (query.type === 'relation' && query.isInteractive) {
                appendToLog('facts', query.syntax.originalStr);
            }
        }
    }
});

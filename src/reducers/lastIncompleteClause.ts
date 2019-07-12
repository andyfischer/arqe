
import { Query } from '../query'
import { declareReducer } from '../framework'
import { freeze } from '../utils'

declareReducer(() => {
    return {
        name: 'lastIncompleteClause',
        value: null,
        reducer(query: Query, value) {
            // reset on eof
            if (query.command === 'eof')
                return null;

            if (query.isIncomplete)
                return freeze(query);

            if (query.syntax.indent > 0)
                return value;

            return null;
        }
    }
});

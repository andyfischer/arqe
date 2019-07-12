
import { Query } from '../query'
import { declareReducer } from '../framework'

declareReducer(() => {
    return {
        name: 'autocompleteInfo',
        value: {
            everyWord: {}
        },
        spamsChangeLog: true,
        reducer(query: Query, value) {
            for (const clause of query.syntax.clauses) {
                value.everyWord[clause.key] = true;
            }

            return value;
        }
    }
});

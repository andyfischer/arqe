
import { Query } from '../query'
import { declareReducer } from '../framework'

declareReducer(() => {
    return {
        name: 'defineToggle',
        value: { },
        reducer(query: Query, value) {
            if (query.command === 'define-toggle') {
                const name = query.commandArgs[0];
                const enableCommand = query.commandArgs[1];
            }
        }
    }
});

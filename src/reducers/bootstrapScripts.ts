
import { Query } from '..'
import { declareReducer } from '../framework'

declareReducer(() => {
    return {
        name: 'bootstrapScripts',
        value: {
            scripts: {}
        },
        reducer(query: Query, value) {
            if (query.relationSubject === 'bootstrap-scripts') {
                if (query.relation === 'includes') {
                    for (const arg of query.relationArgs)
                        value.scripts[arg] = true;
                }
            }
            return value;
        }
    }
});


import { Query } from '../query'
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
                    value.scripts[query.relationObject] = true;
                }
            }
            return value;
        }
    }
});

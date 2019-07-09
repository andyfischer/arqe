
import { Query } from '../query'
import DocumentMount from '../snapshot/DocumentMount'

export default function autocompleteInfoDoc(): DocumentMount {
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
}


import { Query } from '../query'
import DocumentMount from '../snapshot/DocumentMount'
import { print } from '../utils'

export default function invalidQueryCheck(): DocumentMount {
    return {
        name: 'invalidQueryCheck',
        value: null,
        reducer(query: Query, value) {
            if (query.type === 'unknown')
                print('warning: unrecogized query: ' + query.syntax.originalStr);
        }
    }
}



import { Query } from '../query'
import DocumentMount from '../snapshot/DocumentMount'
import { freeze } from '../utils'

export default function commandsDoc(): DocumentMount {
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
}


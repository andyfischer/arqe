
import { Query } from '..'
import { freeze } from '../utils'

export default function(query: Query) {
    query.snapshot.modifyGlobal('lastIncompleteClause', (value) => {
        // reset on eof
        if (query.command === 'eof')
            return null;

        if (query.isIncomplete) {
            return freeze(query.syntax);
        }

        if (query.syntax.indent > 0)
            return value;

        return null;
    });
}

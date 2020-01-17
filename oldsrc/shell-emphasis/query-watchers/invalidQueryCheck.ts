
import { Query } from '..'
import { print } from '../utils'
import { sourcePosToString } from '../types/SourcePos'

export default function(query: Query) {
    if (query.type === 'unknown') {
        let msg = `warning: unrecognized query: '${query.syntax.originalStr}'`;

        if (query.syntax.sourcePos && query.syntax.sourcePos.filename)
            msg += ` (from ${sourcePosToString(query.syntax.sourcePos)})`;

        print(msg);
    }
}

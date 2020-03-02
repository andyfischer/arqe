
import { Query } from '..'
import { appendToLog } from '../storage'

export default function(query: Query) {
    if (query.type === 'relation' && query.isInteractive) {
        appendToLog('facts', query.syntax.originalStr);
    }
}

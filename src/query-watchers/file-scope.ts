
import { Query } from '..'

export default function(query: Query) {
    if (query.command === 'eof') {
        query.snapshot.fileScopedValues = {}
        return;
    }
}

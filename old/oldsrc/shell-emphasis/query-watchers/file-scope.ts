
import { Query } from '..'

export default function(query: Query) {
    if (query.command === 'eof') {
        // FIXME: close the file scope
        return;
    }
}

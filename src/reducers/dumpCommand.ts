
/*
import { Query, QueryContext } from '../query'
import { Snapshot, DocumentMount } from '../snapshot'
import { print } from '../utils'

export default function dumpCommand(): DocumentMount {
    return {
        name: 'dumpCommand',
        value: null,
        reducer(query: Query, value, cxt: QueryContext) {
            if (query.command === 'dump') {
                const docName = query.clauses[1].key;

                if (!cxt.snapshot.hasDocument(docName)) {
                    print('error: document not found: ' + docName);
                    return;
                }

                const value = cxt.snapshot.getValue(docName);
                print(`document ${docName} = ${JSON.stringify(value)}`);
            }
        }
    }
}
*/

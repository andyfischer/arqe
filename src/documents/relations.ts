
import { Query } from '../query'
import DocumentMount from '../snapshot/DocumentMount'
import { print } from '../utils'

const verbose = !!process.env.verbose;

export default function relationsDoc(): DocumentMount {
    return {
        name: 'relations',
        value: { },
        reducer(query: Query, set) {
            if (query.command === 'def-relation') {
                const rel = query.commandArgs[0];
                if (!set[rel]) {
                    set[rel] = true;

                    if (verbose)
                        print('defined relation: ' + rel);
                }
            }
            return set;
        }
    }
}

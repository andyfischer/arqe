
import { implement, Query } from '..'
import { print } from '../utils'
import { Snapshot } from '../framework'

const verbose = false;

export default function(snapsho: Snapshot) {
    implement('def-relation', async (query: Query) => {
        const rel = query.args[0];

        query.snapshot.modifyGlobal('relations', set => {
            if (!set) {
                set = {};
            }

            if (!set[rel]) {
                set[rel] = true;

                if (verbose)
                    print('defined relation: ' + rel);
            }

            return set;
        });
    });
}

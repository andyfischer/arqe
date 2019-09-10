
import { implement, Query } from '..'
import { print } from '../utils'

const verbose = false;

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

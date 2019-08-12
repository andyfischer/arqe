
import { Query } from '..'
import { declareReducer } from '../framework'
import { print } from '../utils'

const verbose = !!process.env.verbose;

declareReducer(() => {
    return {
        name: 'relations',
        value: { },
        reducer(query: Query, set) {
            if (query.command === 'def-relation') {
                const rel = query.args[0];
                if (!set[rel]) {
                    set[rel] = true;

                    if (verbose)
                        print('defined relation: ' + rel);
                }
            }

            return set;
        }
    }
});

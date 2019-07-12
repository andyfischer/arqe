
import { Query } from '../query'
import { declareReducer } from '../framework'
import { print } from '../utils'

const verbose = !!process.env.verbose;

declareReducer(() => {
    return {
        name: 'declarations',
        value: { },
        reducer(query: Query, set) {
            if (query.command === 'def-declaration') {
                const rel = query.commandArgs[0];
                if (!set[rel]) {
                    set[rel] = true;

                    if (verbose)
                        print('defined declaration: ' + rel);
                }
            }

            return set;
        }
    }
});

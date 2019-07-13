
import { Query } from '../query'
import { declareReducer } from '../framework'
import { print } from '../utils'

const verbose = !!process.env.verbose;

declareReducer(() => {
    return {
        name: 'set',
        value: { },
        reducer(query: Query, value) {
            for (const clause of query.syntax.clauses) {
                value.everyWord[clause.key] = true;

                const options = query.options;

                for (const k in options) {
                    const v = options[k];

                    if (verbose)
                        print(`setting '${k}' to '${v}'`);

                    query.snapshot.globalValues[k] = options[k];
                }
            }

            return value;
        }
    }
});

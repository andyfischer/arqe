
import { Query } from '../query'
import { declareReducer } from '../framework'
import { print } from '../utils'

const verbose = !!process.env.verbose;

declareReducer(() => {
    return {
        name: 'set',
        value: { },
        reducer(query: Query, value) {
            if (query.command === 'set') {
                const name = query.commandArgs[0];
                const value = query.commandArgs[1];

                const options = query.options;

                if (verbose)
                    print(`setting '${name}' to: '${value}'`);

                query.snapshot.globalValues[name] = value;
            }
        }
    }
});

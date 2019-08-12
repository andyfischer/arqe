
import { Query } from '..'
import { declareReducer } from '../framework'

function update(query: Query, value) {
    if (query.command === 'set-in-current-file') {
        const key = query.args[1];
        const value = query.args[2];

        query.snapshot.fileScopedValues[key] = value;
        return;
    }

    if (query.command === 'eof') {
        query.snapshot.fileScopedValues = {}
        return;
    }
}

declareReducer(() => {
    return {
        name: 'fileScopedValues',
        value: { },
        reducer(query: Query, value) {
            update(query, value);
            return;
        }
    }
});


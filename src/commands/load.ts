
import { declareCommand, Query } from '..'

async function load(query: Query) {
}

declareCommand({
    name: 'load',
    run: load
});


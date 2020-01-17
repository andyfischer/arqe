
import { Snapshot } from '../framework'
import { Query } from '..'
import { print } from '..'

export default function(snapshot: Snapshot) {
    snapshot.implement('def-slot', (query: Query) => {
        const name = query.args[0];
        query.snapshot.globalScope.createSlot(name);
    });
}

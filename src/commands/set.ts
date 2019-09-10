
import { Query } from '..'
import { getCommandDatabase } from '../types/CommandDatabase'
import { print } from '../utils'
import { Snapshot } from '../framework'

export default function(snapshot: Snapshot) {
    snapshot.implement('set', async (query: Query) => {
        const name = query.get('name');
        const value = query.get('value');

        const options = query.options;

        query.snapshot.globalValues[name] = value;

        query.respond(`set '${name}' to: '${value}'`)
    });
}

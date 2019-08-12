
import { implement, Query } from '..'
import { getCommandDatabase } from '../types/CommandDatabase'
import { print } from '../utils'

implement('set', async (query: Query) => {
    const name = query.args[0];
    const value = query.args[1];

    const options = query.options;

    query.snapshot.globalValues[name] = value;

    query.respond(`set '${name}' to: '${value}'`)
});

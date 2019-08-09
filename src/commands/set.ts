
import { implement, Query } from '..'
import { getCommandDatabase } from '../types/CommandDatabase'
import { print } from '../utils'

implement('set', async (query: Query) => {
    const name = query.commandArgs[0];
    const value = query.commandArgs[1];

    const options = query.options;

    query.snapshot.globalValues[name] = value;

    query.respond(`set '${name}' to: '${value}'`)
});

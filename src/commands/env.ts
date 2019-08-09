
import { implement, Query } from '..'
import { getCommandDatabase } from '../types/CommandDatabase'
import { print } from '../utils'

implement('env', async (query: Query) => {
    const env = Object.assign({}, query.snapshot.globalValues, {
        commandDatabase: undefined
    });
    query.respond(JSON.stringify(query.snapshot.globalValues, null, 2));
});

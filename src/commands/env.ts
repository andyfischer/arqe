
import { implement, Query } from '..'
import { getCommandDatabase } from '../types/CommandDatabase'
import { print } from '../utils'
import { Snapshot } from '../framework'

export default function(snapsho: Snapshot) {
    implement('env', async (query: Query) => {
        const env = Object.assign({}, query.snapshot.globalValues, {
            commandDatabase: undefined
        });
        query.respond(JSON.stringify(query.snapshot.globalValues, null, 2));
    });
}

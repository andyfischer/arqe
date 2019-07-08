
import { Query } from '..'
import { getCommandDatabase } from '../types/CommandDatabase'
import { print } from '../utils'
import { Snapshot } from '../framework'

export default function(snapshot: Snapshot) {
    snapshot.implement('env', async (query: Query) => {
        query.respond('fixme');
        /*
        const env = Object.assign({}, query.snapshot.globalValues, {
            commandDatabase: undefined
        });
        query.respond(JSON.stringify(query.snapshot.globalValues, null, 2));
        */
    });
}


import { Query } from '..'
import { declareCommand } from '../framework'
import { getCommandDatabase } from '../types/CommandDatabase'
import { print } from '../utils'

declareCommand({
    name: 'env',
    async run(query: Query) {
        const env = Object.assign({}, query.snapshot.globalValues, {
            commandDatabase: undefined
        });
        query.respond(JSON.stringify(query.snapshot.globalValues, null, 2));
    }
});

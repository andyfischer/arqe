
import { Query } from '../query'
import { declareCommand, CommandContext } from '../framework'
import { getCommandDatabase } from '../types/CommandDatabase'
import { print } from '../utils'

declareCommand({
    name: 'env',
    async run(context: CommandContext) {

        const query = context.query;

        const env = Object.assign({}, query.snapshot.globalValues, {
            commandDatabase: undefined
        });
        query.respond(JSON.stringify(query.snapshot.globalValues, null, 2));
    }
});


import { Query } from '../query'
import { declareCommand, CommandContext } from '../framework'
import { getCommandDatabase } from '../types/CommandDatabase'
import { print } from '../utils'

declareCommand({
    name: 'env',
    async run(context: CommandContext) {
        const env = Object.assign({}, context.snapshot.globalValues, {
            commandDatabase: undefined
        });
        context.query.respond(JSON.stringify(context.snapshot.globalValues, null, 2));
    }
});

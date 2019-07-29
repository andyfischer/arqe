
import { Query } from '../query'
import { declareCommand } from '../framework'
import { getCommandDatabase } from '../types/CommandDatabase'
import { print } from '../utils'

declareCommand({
    name: 'set',
    async run(query: Query) {
        const name = query.commandArgs[0];
        const value = query.commandArgs[1];

        const options = query.options;

        query.snapshot.globalValues[name] = value;

        query.respond(`set '${name}' to: '${value}'`)
    }
});

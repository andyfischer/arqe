
import { CommandContext, declareCommand, runAsMain } from '../framework'
import { print } from '../utils'
import { getCommandDatabase, CommandDatabase } from '../types/CommandDatabase'

async function run(context: CommandContext) {
    const db = getCommandDatabase(context);

    print("Available commands: ")
    for (const command in db.byName) {
        print("  " + command);
    }
}

declareCommand({
    name: 'help',
    run
});

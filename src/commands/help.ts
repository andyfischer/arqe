
import { CommandContext, declareCommand, runAsMain } from '../framework'
import { print } from '../utils'

async function run(context: CommandContext) {
    const commandDB = await context.get('commandDB');

    print("Available commands: ")
    for (const command in commandDB.byName) {
        print("  " + command);
    }
}

const command = declareCommand({
    name: 'help',
    run
});

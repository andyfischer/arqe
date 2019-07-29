
import { CommandContext, declareCommand, runAsMain } from '../framework'
import { print } from '../utils'
import { getCommandDatabase, CommandDatabase } from '../types/CommandDatabase'

async function run(context: CommandContext) {
    const db = getCommandDatabase(context);

    const lines = ["Available commands: "];
    
    for (const command in db.byName) {
        lines.push("  " + command);
    }

    context.query.respond(lines.join('\n'));
}

declareCommand({
    name: 'help',
    run
});

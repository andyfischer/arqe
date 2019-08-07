
import { Query } from '..'
import { declareCommand, runAsMain } from '../framework'
import { print } from '../utils'
import { getCommandDatabase, CommandDatabase } from '../types/CommandDatabase'

async function run(query: Query) {
    const db = getCommandDatabase(query);

    const lines = ["Available commands: "];
    
    for (const command in db.byName) {
        lines.push("  " + command);
    }

    query.respond(lines.join('\n'));
}

declareCommand({
    name: 'help',
    run
});

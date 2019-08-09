
import { Query } from '..'
import { declareCommand, runAsMain } from '../framework'
import { print } from '../utils'
import { getCommandDatabase, CommandDatabase } from '../types/CommandDatabase'

async function run(query: Query) {
    const db = getCommandDatabase(query);

    const lines = [];

    const commands = []
    
    for (const commandName in db.byName) {
        const command = db.byName[commandName];

        if (command.notForHumans)
            continue;

        commands.push(commandName);
    }

    commands.sort();

    query.respond("Available commands: \n"
                  + commands.join(', '));
}

declareCommand({
    name: 'help',
    run
});

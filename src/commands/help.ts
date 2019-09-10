
import { Query } from '..'
import { print } from '../utils'
import { getCommandDatabase, CommandDatabase } from '../types/CommandDatabase'
import { Snapshot } from '../framework'

export default function(snapshot: Snapshot) {
    snapshot.implement('help', async (query: Query) => {
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

        query.respond({ title: "Available commands:", items: commands });
    });
}

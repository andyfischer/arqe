
import { Query } from '../query'
import { declareCommand, CommandContext } from '../framework'
import { getCommandDatabase } from '../types/CommandDatabase'
import { print } from '../utils'

declareCommand({
    name: 'define-toggle',
    async run(query: Query) {
        const enableCommand = query.get('name');
        const db = getCommandDatabase(query);

        if (!enableCommand.startsWith('enable-')) {
            query.respond({
                error: "define-toggle command should start with 'enable-'"
            });
            return;
        }

        const disableCommand = enableCommand.replace('enable-', 'disable-');

        db.byName[enableCommand] = {
            name: enableCommand,
            args: {},
            mainArgs: [],
            run: (query: Query) => {
                query.respond({
                    effects: [{type: 'assign-global', name: enableCommand, value: true}],
                    message: `set ${enableCommand} to true`
                })
            }
        }
        
        db.byName[disableCommand] = {
            name: disableCommand,
            mainArgs: [],
            args: {},
            run: (query: Query) => {
                query.respond({
                    effects: [{type: 'assign-global', name: enableCommand, value: false}],
                    message: `set ${enableCommand} to false`
                })
            }
        }

        query.respond(null);
    }
});

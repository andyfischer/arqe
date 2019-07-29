
import { Query } from '../query'
import { declareCommand, CommandContext } from '../framework'
import { getCommandDatabase } from '../types/CommandDatabase'
import { print } from '../utils'

declareCommand({
    name: 'define-toggle',
    async run(context: CommandContext) {
        const query = context.query;
        const enableCommand = context.get('name');
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
            run: async (context: CommandContext) => {
                context.set(enableCommand, true)
                context.query.respond(`set ${enableCommand} to true`);
            }
        }
        
        db.byName[disableCommand] = {
            name: disableCommand,
            mainArgs: [],
            args: {},
            run: async (context: CommandContext) => {
                context.set(enableCommand, false)
                context.query.respond(`set ${enableCommand} to false`);
            }
        }

        context.query.respond(null);
    }
});

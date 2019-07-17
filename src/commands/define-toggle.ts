
import { Query } from '../query'
import { declareCommand, CommandContext } from '../framework'
import { getCommandDatabase } from '../types/CommandDatabase'
import { print } from '../utils'

declareCommand({
    name: 'define-toggle',
    async run(context: CommandContext) {
        const enableCommand = context.get('name');
        const db = getCommandDatabase(context);

        if (!enableCommand.startsWith('enable-')) {
            print("error: define-toggle command should start with 'enable-'");
            return;
        }

        const disableCommand = enableCommand.replace('enable-', 'disable-');

        db.byName[enableCommand] = {
            name: enableCommand,
            args: {},
            run: async (context: CommandContext) => context.set(enableCommand, true)
        }
        
        db.byName[disableCommand] = {
            name: disableCommand,
            args: {},
            run: async (context: CommandContext) => context.set(enableCommand, false)
        }
    }
});

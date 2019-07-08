
import { CommandContext, declareCommand } from '../framework'
import { print } from '../utils'

export default declareCommand({
    name: 'show-commands',
    async run(context: CommandContext) {
        const db = context.get('commandDB');
        print(JSON.stringify(db, null, 2));
    }
});

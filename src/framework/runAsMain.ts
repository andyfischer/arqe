
import { CommandDefinition, CommandContext } from '.'
import { getMainSnapshot } from '../snapshot'

export default async function runAsMain(def: CommandDefinition) {

    const context = new CommandContext();
    context.snapshot = await getMainSnapshot();

    try {
        await def.run(context);
    } catch (err) {
        console.error(err.stack || err);
    }
}

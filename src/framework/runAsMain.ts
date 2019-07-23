
import { CommandDefinition, CommandContext } from '.'
import { loadMainSnapshot } from '.'

export default async function runAsMain(def: CommandDefinition) {

    const context = new CommandContext();
    context.snapshot = await loadMainSnapshot();

    try {
        await def.run(context);
    } catch (err) {
        console.error(err.stack || err);
    }
}

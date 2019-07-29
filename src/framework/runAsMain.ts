
import { CommandDefinition, CommandContext } from '.'
import { loadMainSnapshot } from '.'

export default async function runAsMain(def: CommandDefinition) {

    const context = new CommandContext();
    context.snapshot = await loadMainSnapshot();

    throw new Error('runAsMain not working right now');

    try {
    } catch (err) {
        console.error(err.stack || err);
    }
}

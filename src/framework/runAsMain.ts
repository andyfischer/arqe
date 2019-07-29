
import { CommandDefinition } from '.'
import { loadMainSnapshot } from '.'

export default async function runAsMain(def: CommandDefinition) {

    throw new Error('runAsMain not working right now');

    try {
    } catch (err) {
        console.error(err.stack || err);
    }
}

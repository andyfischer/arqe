
import { CommandContext } from '.'
import { Query } from '../query'
import { Snapshot } from '../snapshot'
import { everyCommand } from '../framework/declareCommand'
import { print, values } from '../utils'
import '../commands/_everyCommand'

const verbose = !!process.env.verbose;

export default async function runCommand(snapshot: Snapshot, query: Query) {

    // Look up command definition.
    const command = snapshot.getValue('commandDB').byName[query.command];

    if (!command) {
        print('warning: command not defined: ' + query.command);
        return;
    }

    if (command.hasNoImplementation)
        return;

    const commandImpl = everyCommand[query.command];

    if (!commandImpl) {
        print('warning: no impl found for command: ' + query.command);
        return;
    }

    function valueIsDefined(name: string) {
        const value = snapshot.getValueOpt(name);
        if (value.found)
            return true;

        return query.options[name] != null;
    }

    // check command requirements
    for (const arg of values(command.args)) {
        if (arg.isRequired && !valueIsDefined(arg.key)) {
            print('missing required argument: ' + arg.key);
            return;
        }
    }

    const context = new CommandContext()
    context.snapshot = snapshot;
    context.query = query;

    await commandImpl.run(context);

    for (const k in context.results) {
        print(`  ${k} = ${context.results[k]}`);
    }
}

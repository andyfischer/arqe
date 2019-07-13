
import { CommandContext } from '.'
import { Query } from '../query'
import { Snapshot } from '../snapshot'
import { everyCommand } from '../framework/declareCommand'
import { print, values } from '../utils'
import { CommandDatabase } from '../reducers/commandDatabase'
import '../commands/_everyCommand'

const verbose = !!process.env.verbose;

export default async function runCommand(snapshot: Snapshot, query: Query) {

    // Look up command definition.
    const commandDB: CommandDatabase = snapshot.getValue('commandDB');
    const command = commandDB.byName[query.command];

    if (!command) {
        print('warning: command not defined: ' + query.command);
        return;
    }

    function findValue(name: string) {

        if (query.options[name])
            return query.options[name];

        if (command.mainArg === name && query.commandArgs.length > 0)
            return query.commandArgs[0];

        const value = snapshot.getValueOpt(name);
        if (value.found)
            return value.found;
    }

    const incoming = {}
    let cantRunCommand = false;

    // Resolve incoming values
    for (const argName in command.args) {
        const arg = command.args[argName];
        const value = findValue(argName);

        if (value === undefined) {
            if (arg.isRequired) {
                print('error: missing required argument: ' + argName);
                print('  query was: ' + query.syntax.originalStr);
                cantRunCommand = true;
            }
        } else {
            incoming[argName] = value;
        }
    }

    if (!command.mainArg && query.commandArgs.length > 0) {
        print(`warning: command ${command.name} doesn't expect any main args`);
    } else if (query.commandArgs.length > 1) {
        print("warning: too many main args");
    }

    if (cantRunCommand)
        return;

    if (command.hasNoImplementation)
        return;

    const commandImpl = everyCommand[query.command];

    if (!commandImpl) {
        print('warning: no impl found for command: ' + query.command);
        return;
    }


    const context = new CommandContext()
    context.snapshot = snapshot;
    context.query = query;
    context.incoming = incoming;

    await commandImpl.run(context);

    for (const k in context.results) {
        print(`  ${k} = ${context.results[k]}`);
    }
}

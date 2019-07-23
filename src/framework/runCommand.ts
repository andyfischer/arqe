
import { Snapshot, CommandContext } from '.'
import { Query } from '../query'
import { everyCommand } from '../framework/declareCommand'
import { print, values } from '../utils'
import { getCommandDatabase, CommandDatabase } from '../types/CommandDatabase'
import '../commands'

const verbose = !!process.env.verbose;

export default async function runCommand(query: Query) {

    // Look up command definition.
    const snapshot = query.snapshot;
    const commandDB: CommandDatabase = getCommandDatabase(query);
    const command = commandDB.byName[query.command];

    if (!command) {
        print('warning: command not defined: ' + query.command);
        return;
    }

    function findValue(name: string) {

        if (query.options[name])
            return query.options[name];

        for (let i=0; i < command.mainArgs.length; i++) {
            const mainArg = command.mainArgs[i];
            if (mainArg === name && query.commandArgs.length >= i) {
                return query.commandArgs[i];
            }
        }

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
                cantRunCommand = true;
            }
        } else {
            incoming[argName] = value;
        }
    }

    if (command.mainArgs.length === 0 && query.commandArgs.length > 0) {
        print(`warning: command ${command.name} doesn't expect any main args`);
    } else if (query.commandArgs.length > command.mainArgs.length) {
        print("warning: too many main args");
    }

    if (cantRunCommand) {
        return;
    }

    if (command.hasNoImplementation) {
        return;
    }

    if (command.run) {
        const context = new CommandContext()
        context.snapshot = snapshot;
        context.query = query;
        context.incoming = incoming;

        await command.run(context);

        for (const k in context.results) {
            print(`note:  ${k} = ${context.results[k]}`);
        }
    }

    const commandImpl = everyCommand[query.command];

    if (commandImpl) {
        const context = new CommandContext()
        context.snapshot = snapshot;
        context.query = query;
        context.incoming = incoming;

        await commandImpl.run(context);

        for (const k in context.results) {
            print(`note:  ${k} = ${context.results[k]}`);
        }
    }
}

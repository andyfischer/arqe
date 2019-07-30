
import { Snapshot } from '.'
import { Query } from '../query'
import { everyCommand } from '../framework/declareCommand'
import { print, values, timedOut } from '../utils'
import { getCommandDatabase, CommandDatabase } from '../types/CommandDatabase'
import '../commands'

const verbose = !!process.env.verbose;
const MissingValue = Symbol('missing');

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

        const value = snapshot.getValueOpt(name, MissingValue);
        if (value !== MissingValue)
            return value;
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
        print(`warning: too many main args (command = ${command.name}): ${query.syntax.originalStr}`);
    }

    if (cantRunCommand) {
        return;
    }

    if (command.hasNoImplementation) {
        query.respond(null);
        return;
    }

    function queryGet(name: string) {
        if (incoming[name])
            return incoming[name];

        if (query.options[name])
            return query.options[name];

        const value = this.snapshot.getValueOpt(name, MissingValue);
        if (value !== MissingValue)
            return value;

        throw new Error("command get() missing value for: " + name);
    }

    query.get = queryGet;

    if (command.run) {
        await command.run(query);

        if (await timedOut(query.promise, 500)) {
            print(`warning: timed out waiting for response (command = ${query.command}): ${query.syntax.originalStr}`);
        }
    }

    // old style
    const commandImpl = everyCommand[query.command];
    if (commandImpl) {
        await commandImpl.run(query);

        if (await timedOut(query.promise, 500)) {
            print(`warning: timed out waiting for response (command = ${query.command}): ${query.syntax.originalStr}`);
        }
    }
}

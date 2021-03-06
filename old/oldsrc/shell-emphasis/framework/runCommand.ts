
import { Snapshot } from '.'
import { Query } from '..'
import { print, values, timedOut } from '../utils'
import { getCommandDatabase, CommandDatabase } from '../types/CommandDatabase'
import CommandImplementation from '../types/CommandImplementation'
// import { ensureModuleLoaded } from '../lazymodules'

const verbose = !!process.env.verbose;
const MissingValue = Symbol('missing');

export default async function runCommandFromQuery(query: Query) {

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
            if (mainArg === name && query.args.length >= i) {
                return query.args[i];
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

    if (!command.takesAnyArgs) {
        if (command.mainArgs.length === 0 && query.args.length > 0) {
            print(`warning: command ${command.name} doesn't expect any main args`);
        } else if (query.args.length > command.mainArgs.length) {
            print(`warning: too many main args (command = ${command.name}): ${query.syntax.originalStr}`);
        }
    }

    if (cantRunCommand) {
        return;
    }

    /*
    if (command.fromLazyModule) {
        ensureModuleLoaded(command.fromLazyModule);
    }
    */

    if (command.hasNoImplementation) {
        query.respond(null);
        return;
    }

    function queryGetOptional(name: string, defaultValue: any) {
        if (incoming[name])
            return incoming[name];

        if (query.options[name])
            return query.options[name];

        return query.snapshot.getValueOpt(name, defaultValue);
    }

    function queryGet(name: string) {
        const value = queryGetOptional(name, MissingValue);
        if (value !== MissingValue)
            return value;

        throw new Error("command get() missing value for: " + name);
    }

    query.get = queryGet;
    query.getOptional = queryGetOptional;

    const func: CommandImplementation = command.run || snapshot.commandImplementations[query.command];

    if (!func) {
        if (query.isInteractive)
            print(`warning: no implementation found for command: ${query.command}`);

        return;
    }

    try {
        await func(query);
    } catch (err) {
        print(err.stack || err);
        return;
    }

    const timeoutMs = snapshot.getValueOpt('query-handler/timeoutms', 0);

    if (timeoutMs) {
        if (await timedOut(query.promise, timeoutMs)) {
            print(`warning: timed out waiting for response (command = ${query.command}): ${query.syntax.originalStr}`);
        }
    }
}


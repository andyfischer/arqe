"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const CommandDatabase_1 = require("../types/CommandDatabase");
const verbose = !!process.env.verbose;
const MissingValue = Symbol('missing');
function runCommandFromQuery(query) {
    return __awaiter(this, void 0, void 0, function* () {
        const snapshot = query.snapshot;
        const commandDB = CommandDatabase_1.getCommandDatabase(query);
        const command = commandDB.byName[query.command];
        if (!command) {
            utils_1.print('warning: command not defined: ' + query.command);
            return;
        }
        function findValue(name) {
            if (query.options[name])
                return query.options[name];
            for (let i = 0; i < command.mainArgs.length; i++) {
                const mainArg = command.mainArgs[i];
                if (mainArg === name && query.args.length >= i) {
                    return query.args[i];
                }
            }
            const value = snapshot.getValueOpt(name, MissingValue);
            if (value !== MissingValue)
                return value;
        }
        const incoming = {};
        let cantRunCommand = false;
        for (const argName in command.args) {
            const arg = command.args[argName];
            const value = findValue(argName);
            if (value === undefined) {
                if (arg.isRequired) {
                    utils_1.print('error: missing required argument: ' + argName);
                    cantRunCommand = true;
                }
            }
            else {
                incoming[argName] = value;
            }
        }
        if (!command.takesAnyArgs) {
            if (command.mainArgs.length === 0 && query.args.length > 0) {
                utils_1.print(`warning: command ${command.name} doesn't expect any main args`);
            }
            else if (query.args.length > command.mainArgs.length) {
                utils_1.print(`warning: too many main args (command = ${command.name}): ${query.syntax.originalStr}`);
            }
        }
        if (cantRunCommand) {
            return;
        }
        if (command.hasNoImplementation) {
            query.respond(null);
            return;
        }
        function queryGetOptional(name, defaultValue) {
            if (incoming[name])
                return incoming[name];
            if (query.options[name])
                return query.options[name];
            return query.snapshot.getValueOpt(name, defaultValue);
        }
        function queryGet(name) {
            const value = queryGetOptional(name, MissingValue);
            if (value !== MissingValue)
                return value;
            throw new Error("command get() missing value for: " + name);
        }
        query.get = queryGet;
        query.getOptional = queryGetOptional;
        const func = command.run || snapshot.commandImplementations[query.command];
        if (!func) {
            if (query.isInteractive)
                utils_1.print(`warning: no implementation found for command: ${query.command}`);
            return;
        }
        try {
            yield func(query);
        }
        catch (err) {
            utils_1.print(err.stack || err);
            return;
        }
        const timeoutMs = snapshot.getValueOpt('query-handler/timeoutms', 0);
        if (timeoutMs) {
            if (yield utils_1.timedOut(query.promise, timeoutMs)) {
                utils_1.print(`warning: timed out waiting for response (command = ${query.command}): ${query.syntax.originalStr}`);
            }
        }
    });
}
exports.default = runCommandFromQuery;
//# sourceMappingURL=runCommand.js.map
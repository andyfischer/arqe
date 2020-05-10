"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CommandExecution_1 = __importDefault(require("./CommandExecution"));
const JoinCommand_1 = require("./JoinCommand");
function setupCommandExecution(commandExec) {
    switch (commandExec.commandName) {
        case 'join':
            JoinCommand_1.setupJoinExecution(commandExec);
            break;
    }
}
function runCommandChain(graph, chain, output) {
    // Set up commands
    const commandExecs = chain.commands.map(command => {
        const exec = new CommandExecution_1.default(graph, command);
        setupCommandExecution(exec);
        return exec;
    });
    // Link up commands
    for (let index = 0; index < commandExecs.length; index++) {
        const isFirst = index == 0;
        const isLast = index == commandExecs.length - 1;
        const commandExec = commandExecs[index];
        if (isLast)
            commandExec.outputTo(output);
        if (!isLast) {
            const next = commandExecs[index + 1];
            if (!next.input)
                throw new Error(`piped command '${next.command.commandName}' didn't expect input`);
            commandExec.outputTo(next.input);
        }
    }
    for (const commandExec of commandExecs)
        graph.runCommandExecution(commandExec);
}
exports.runCommandChain = runCommandChain;

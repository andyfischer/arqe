"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CommandStep_1 = __importDefault(require("./CommandStep"));
const RelationPipe_1 = __importDefault(require("./RelationPipe"));
const runSearch_1 = __importDefault(require("./runSearch"));
const CommandMeta_1 = require("./CommandMeta");
const runJoin_1 = require("./runJoin");
const runSet_1 = __importDefault(require("./runSet"));
const runDelete_1 = __importDefault(require("./runDelete"));
const runListen_1 = __importDefault(require("./runListen"));
const RelationSearch_1 = require("./RelationSearch");
const knownCommands = {
    'join': true,
    'get': true,
    'set': true,
    'delete': true,
    'listen': true
};
function runStep(step) {
    try {
        CommandMeta_1.emitCommandOutputFlags(step.command, step.output);
        switch (step.command.commandName) {
            case 'join':
                runJoin_1.runJoinStep(step);
                return;
            case 'get': {
                CommandMeta_1.emitSearchPatternMeta(step.command.pattern, step.output);
                runSearch_1.default(step.graph, RelationSearch_1.newRelationSearch(step.command.pattern, step.output));
                return;
            }
            case 'set': {
                runSet_1.default(step.graph, step.command.toRelation(), step.output);
                return;
            }
            case 'delete': {
                runDelete_1.default(step.graph, step.pattern, step.output);
                return;
            }
            case 'listen': {
                runListen_1.default(step.graph, step);
                return;
            }
        }
        CommandMeta_1.emitCommandError(step.output, "unrecognized command: " + step.commandName);
        step.output.finish();
    }
    catch (err) {
        console.log(err.stack || err);
        CommandMeta_1.emitCommandError(step.output, "internal error: " + (err.stack || err));
        step.output.finish();
    }
}
function singleCommandExecution(graph, command) {
    const step = new CommandStep_1.default(graph, command);
    step.input = new RelationPipe_1.default();
    step.input.finish();
    step.output = new RelationPipe_1.default();
    return step;
}
exports.singleCommandExecution = singleCommandExecution;
function runCommandChain(graph, chain, output) {
    if (!graph)
        throw new Error('graph is null');
    if (chain.commands.length === 0) {
        output.finish();
        return;
    }
    for (const command of chain.commands) {
        if (!knownCommands[command.commandName]) {
            CommandMeta_1.emitCommandError(output, "unrecognized command: " + command.commandName);
            output.finish();
            return;
        }
    }
    const steps = [];
    for (const command of chain.commands) {
        const step = new CommandStep_1.default(graph, command);
        step.input = (steps.length === 0) ? new RelationPipe_1.default() : steps[steps.length - 1].output;
        step.output = new RelationPipe_1.default();
        steps.push(step);
    }
    steps[0].input.finish();
    steps[steps.length - 1].output.pipeToReceiver(output);
    for (const step of steps)
        runStep(step);
}
exports.runCommandChain = runCommandChain;
//# sourceMappingURL=runCommand.js.map
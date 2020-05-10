"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CommandStep_1 = __importDefault(require("./CommandStep"));
const RelationPipe_1 = __importDefault(require("./RelationPipe"));
const Search_1 = require("./Search");
const CommandMeta_1 = require("./CommandMeta");
const JoinCommand_1 = require("./JoinCommand");
const SetCommand_1 = require("./SetCommand");
function runStep(step) {
    try {
        CommandMeta_1.emitCommandOutputFlags(step.command, step.output);
        switch (step.command.commandName) {
            case 'join':
                JoinCommand_1.runJoinStep(step);
                return;
            case 'get':
                runGetStep(step);
                return;
            case 'set': {
                SetCommand_1.runSetStep(step.graph, step);
                return;
            }
            case 'modify': {
                return;
            }
            case 'delete': {
                step.graph.deleteCmd(step);
                return;
            }
            case 'listen': {
                step.graph.listen(step);
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
function runGetStep(step) {
    const search = step.toRelationSearch();
    CommandMeta_1.emitSearchPatternMeta(step.command.toPattern(), search);
    Search_1.runSearch(step.graph, search);
    return;
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
//# sourceMappingURL=doCommand.js.map
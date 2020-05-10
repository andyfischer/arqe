"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getProcessClient_1 = __importDefault(require("../toollib/getProcessClient"));
const ToolShellApi_1 = __importDefault(require("./ToolShellApi"));
const CommandLineToolApi_1 = __importDefault(require("./CommandLineToolApi"));
const minimist_1 = __importDefault(require("minimist"));
async function runStandardProcess2(toolName, handler) {
    let graph;
    try {
        graph = await getProcessClient_1.default();
    }
    catch (e) {
        console.error('Failed to connect to server: ' + e);
        process.exitCode = -1;
        return;
    }
    const args = minimist_1.default(process.argv.slice(2));
    let failedLaunch = false;
    const shellApi = new ToolShellApi_1.default(graph);
    const execId = await shellApi.createToolExecution();
    for (const input of await shellApi.listCliInputs(toolName)) {
        console.log('tool uses input: ' + input);
        if (args[input]) {
            await shellApi.setCliInput(execId, input, args[input]);
        }
        if (await shellApi.cliInputIsRequired(toolName, input)) {
            if (!args[input]) {
                console.log('Missing required param: --' + input);
                failedLaunch = true;
            }
        }
    }
    if (failedLaunch) {
        process.exit(-1);
    }
    try {
        const cliApi = new CommandLineToolApi_1.default(graph);
        cliApi.execId = execId;
        await handler(graph, cliApi);
    }
    catch (e) {
        console.error('Unhandled exception in runStandardProcess');
        console.error(e);
        process.exitCode = -1;
    }
    graph.close();
}
exports.default = runStandardProcess2;
//# sourceMappingURL=runStandardProcess2.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("./fs");
const GitBranchesApi_1 = __importDefault(require("./GitBranchesApi"));
const AppView_1 = __importDefault(require("./AppView"));
const react_1 = __importDefault(require("react"));
const ink_1 = require("ink");
let graph;
let api;
async function start() {
    const api = new GitBranchesApi_1.default(graph);
    const dir = process.cwd();
    const { waitUntilExit } = ink_1.render(react_1.default.createElement(AppView_1.default, { dir, api }), {
        exitOnCtrlC: true
    });
    await waitUntilExit();
}
fs_1.runStandardProcess2('git-branch-browser', async (_graph, api) => {
    graph = _graph;
    await start();
});
//# sourceMappingURL=index.js.map
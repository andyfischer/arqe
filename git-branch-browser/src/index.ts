
import { Graph, runStandardProcess2 } from './fs'
import GitBranchesApi from './GitBranchesApi'
import AppView from './AppView'
import React from 'react'
import { render } from 'ink'

let graph: Graph;
let api: GitBranchesApi;

function start() {
    const api = new GitBranchesApi(graph);
    const dir = process.cwd();
    render(React.createElement(AppView, { dir, api }));
}

runStandardProcess2('git-branch-browser', async (_graph: Graph, api) => {
    graph = _graph;
    start();
});

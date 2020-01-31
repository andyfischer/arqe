
import Graph from '../Graph'
import GraphContext from '../GraphContext'
import parseCommand from '../parseCommand'
import { parsedCommandToString } from '../stringifyQuery'

let graph;
let context;
let graphCalls: string[];

async function runCommand(str: string): Promise<string> {

    return new Promise((resolve, reject) => {
        const command = parseCommand(str);
        context.handleCommand(command, resolve);
    });
}

function preHook(object, funcName, callback) {
    const orig = object[funcName];
    object[funcName] = function () {
        const args = Array.from(arguments)
        callback.apply(null, args);
        return orig.apply(object, args);
    }
}

beforeEach(() => {
    graph = new Graph();

    preHook(graph, 'handleCommand', (command) => {
        graphCalls.push(parsedCommandToString(command));
    })

    context = new GraphContext(graph)

    graphCalls = []
});

it("passes commands on to the graph", async () => {
    const response = await runCommand('get 1');
    expect(graphCalls).toEqual(['get 1']);
});

it("includes context fields", async () => {
    await runCommand('context branch/1');
    const response = await runCommand('get 1');
    expect(graphCalls).toEqual(['get 1 branch/1']);
});

it("supports removing context fields", async () => {
    await runCommand('context branch/1');
    await runCommand('context !branch');
    const response = await runCommand('get 1');
    expect(graphCalls).toEqual(['get 1']);
});

it("removes context from 'set' responses", async () => {
    await runCommand('context branch/1');
    let response: string = await runCommand('set id/#unique');
    expect(graphCalls).toEqual(['set id/#unique branch/1']);
    response = response.replace(/id\/[a-z0-9]*/, 'id/xxx')
    expect(response).toEqual('set id/xxx')
});

it("doesn't echo set if it doesn't need to", async () => {
    let response: string = await runCommand('set a/1 b/2');
    expect(response).toEqual('#done');
});

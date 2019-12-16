
import Graph from '../Graph'
import GraphContext from '../GraphContext'
import parseCommand, { parsedCommandToString } from '../parseCommand'

let graph;
let context;
let graphCalls: string[];

async function runCommand(str: string): Promise<string> {

    return new Promise((resolve, reject) => {
        const command = parseCommand(str);
        command.respond = resolve;
        context.handleCommand(command);
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

it("removes context from 'save' responses", async () => {
    await runCommand('context branch/1');
    let response: string = await runCommand('save id/#unique');
    expect(graphCalls).toEqual(['save id/#unique branch/1']);
    response = response.replace(/id\/[a-z0-9]*/, 'id/xxx')
    expect(response).toEqual('save id/xxx')
});

it("doesn't echo save if it doesn't need to", async () => {
    let response: string = await runCommand('save a/1 b/2');
    expect(response).toEqual('#done');
});

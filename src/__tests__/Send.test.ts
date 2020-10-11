
import Graph from "../Graph";
import setupTableSetV2 from "../setupTableSetV2";
import { run as _run } from './utils'

let graph;
const run = str => _run(graph, str);

beforeEach(() => {
    graph = new Graph();
});

it("send command works", () => {
    const inboxA = [];
    const inboxB = [];

    graph.addTables(setupTableSetV2({
        'inbox a': {
            send: (input, out) => {
                inboxA.push(input);
                out.done();
            }
        },
        'inbox b': {
            send: (input, out) => {
                inboxB.push(input);
                out.done();
            }
        },
    }));

    run('send inbox a/123')
    expect(inboxA.map(t => t.stringify())).toEqual(['inbox a/123']);
});

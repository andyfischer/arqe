
import Graph from "../Graph";
import setupTableSetV2 from "../setupTableSet";
import { run as _run } from './utils'

let graph;
const run = str => _run(graph, str);

beforeEach(() => {
    graph = new Graph();
});

it("run verb works", () => {
    const inboxA = [];
    const inboxB = [];

    graph.addTables(setupTableSetV2({
        'inbox a': {
            run: (input, out) => {
                inboxA.push(input);
                out.done();
            }
        },
        'inbox b': {
            run: (input, out) => {
                inboxB.push(input);
                out.done();
            }
        },
    }));

    run('run inbox a/123')
    expect(inboxA.map(t => t.stringify())).toEqual(['inbox a/123']);
});

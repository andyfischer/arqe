
import Graph from "../Graph";
import setupTableSetV2 from "../setupTableSet";
import { run as _run } from './utils'

let graph;
const run = (str, opts?) => _run(graph, str, opts);

beforeEach(() => {
    graph = new Graph();
});

it("can run a table mount function with an env value", () => {
    graph.addTables(setupTableSetV2({
        'table-1 val': {
            'find someEnv(env)': (input, out) => {
                const { someEnv } = input.obj();
                out.done({ val: 'found env value: ' + someEnv });
            }
        }
    }));

    expect(run('env someEnv/123 | get table-1 val')).toEqual(["table-1 val[found env value: 123]"]);
});

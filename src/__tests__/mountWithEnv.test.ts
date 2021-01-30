
import Graph from "../Graph";
import setupTableSetV2 from "../parseTableDefinition";
import { setupGraph } from './utils'

it("can run a table mount function with an env value", () => {
    const { run, graph } = setupGraph();

    graph.provide({
        'table-1 val': {
            'find someEnv(env)': (input, out) => {
                const { someEnv } = input.obj();
                out.done({ val: 'found env value: ' + someEnv });
            }
        }
    });

    expect(run('env someEnv/123 | get table-1 val').stringifyBody())
        .toEqual(["table-1 val[found env value: 123]"]);
});

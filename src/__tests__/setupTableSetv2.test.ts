import Graph from "../Graph";
import setupTableSetV2, { defineVerbV2 } from "../setupTableSetV2";
import { run as _run } from './utils'

let graph;
const run = (str, opts?) => _run(graph, str, opts);

beforeEach(() => {
    graph = new Graph({autoinitMemoryTables: false});
});

it('can define a simple table', () => {
    graph.addTables(setupTableSetV2({
        'sum a b': {
            'find-with a b': (input, out) => {
                const { a, b } = input.obj();
                const sum = parseFloat(a) + parseFloat(b);
                out.done({ sum });
            }
        },
        'product a b': {
            'find-with a b': (input, out) => {
                const { a, b } = input.obj();
                const product = parseFloat(a) * parseFloat(b);
                out.done({ product });
            }
        }
    }));

    expect(run('get sum a[1] b[3] | just sum')).toEqual(['sum/4']);
    expect(run('get sum a[1] b[10] | just sum')).toEqual(['sum/11']);

    expect(run('get product a[2] b[3] | just product')).toEqual(['product/6']);
    expect(run('get product a[4] b[3] | just product')).toEqual(['product/12']);
});

it('defineVerbV2 works', () => {
    defineVerbV2(graph, 'test-command', 'args', (input, out) => {
        const { args } = input.obj();
        const { i1, i2 } = args.obj();
        out.done({ message: `you sent: ${i1} ${i2}`});
    });

    expect(run('test-command i1/123 i2/456 | just message')).toEqual(['message[you sent: 123 456]']);
});


import Graph from '../Graph'
import { setupGraph } from './utils'
import { symValueType } from '../internalSymbols'

it("subquery works", () => {
    const { run } = setupGraph({
        provide: {
            'test1 a b': {
                'find': (input, out) => {
                    out.done([{a: 1, b: 'one'}, {a: 2, b: 'two'}, {a: 3, b: 'three'}]);
                }
            },
            'test1-mirror a b': {
                'find a sq(subquery)': (input, out) => {
                    const a = input.get('a');
                    const subquery = input.get('sq');

                    subquery(`get test1 a=${a} b | rename from=test1 to=test1-mirror`, out);
                }
            }
        }
    });

    expect(run("get test1-mirror a=1 b | just b").stringifyBody()).toEqual(['b/one']);
});

it("scope works", () => {
    const { run } = setupGraph({
        provide: {
            'test1 a': {
                'find s(scope)'(i,o) {
                    const { s } = i.obj();
                    o.done([{a: s}]);
                }
            }
        }
    });

    const extractedScope = run('test1 a').oneValue('a');
    expect(extractedScope[symValueType]).toEqual('scope');
});

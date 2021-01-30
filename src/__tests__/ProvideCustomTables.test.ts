
import Graph from "../Graph";
import { setupGraph } from './utils'

it('can define a simple table', () => {
    const { run } = setupGraph({
        provide: {
            'sum a b': {
                'find a b': (input, out) => {
                    const { a, b } = input.obj();
                    const sum = parseFloat(a) + parseFloat(b);
                    out.done({ sum });
                }
            },
            'product a b': {
                'find a b': (input, out) => {
                    const { a, b } = input.obj();
                    const product = parseFloat(a) * parseFloat(b);
                    out.done({ product });
                }
            }
        }
    });

    expect(run('get sum a=1 b=3 | just sum').stringifyBody()).toEqual(['sum/4']);
    expect(run('get sum a=1 b=10 | just sum').stringifyBody()).toEqual(['sum/11']);

    expect(run('get product a=2 b=3 | just product').stringifyBody()).toEqual(['product/6']);
    expect(run('get product a=4 b=3 | just product').stringifyBody()).toEqual(['product/12']);
});

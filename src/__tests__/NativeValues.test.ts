
import { setupGraph } from './utils'
import { toTuple } from '../coerce'

it('toTuple takes an object with a native callback', () => {
    const res = toTuple({callback: (a) => `the callback: `+a});

    expect(res.stringify()).toEqual('callback/<native>');
});

it('toTuple takes an object with a native instance', () => {
    class TheClass {
        isItTheClass() {
            return 'yes'
        }
    }

    const res = toTuple({the_class: new TheClass()});

    expect(res.get('the_class').isItTheClass()).toEqual('yes');
});

it('can provide a native function from a table', () => {
    const { graph, run } = setupGraph();

    graph.provide({
        callback: {
            find: (i,o) => {
                o.done([{callback: (a) => `the callback: `+a}]);
            }
        }
    });

    const result = run('get callback').one();
    expect(result.stringify()).toEqual('callback/<native>');
});

import TableMount from "../TableMount"
import parseTuple from "../parser/parseTuple";
import { setupGraph } from './utils'
import { Graph } from "..";
import { unwrapTuple } from "../tuple/UnwrapTupleCallback";


it('handles insert with (unique)', () => {
    const { run, graph } = setupGraph();

    const table = new TableMount('test', parseTuple('t x y'));

    let nextUniqueX = 1;
    const entriesByX = { }

    table.addHandler('insert', 'x(unique) y', unwrapTuple(({y}) => {
        const x = nextUniqueX;
        entriesByX[x] = y;
        nextUniqueX += 1;
        return { x, y }
    }));

    table.addHandler('insert', 'x y', unwrapTuple(({x, y}) => {
        entriesByX[x] = y;
        return { x, y }
    }));

    graph.addTable(table);

    expect(run('set t x(unique) y=one').stringifyBody()).toEqual(['t x/1 y/one']);
    expect(entriesByX).toEqual({ '1': 'one' });

    run('set t x(unique) y=two');
    expect(entriesByX).toEqual({ '1': 'one', '2': 'two' })

    run('set t x=5 y=five');
    expect(entriesByX).toEqual({ '1': 'one', '2': 'two', '5': 'five' })
})

it('insert(unique) matches the correct attr', () => {
    const { run, graph } = setupGraph();

    const table = new TableMount('test', parseTuple('t x y z'));

    const inserts = [];

    table.addHandler('insert', 'x(unique) y z', unwrapTuple(({y, z}) => {
        inserts.push({ xUnique: true, y, z })
    }));

    table.addHandler('insert', 'x y(unique) z', unwrapTuple(({x, y, z}) => {
        inserts.push({ yUnique: true, x, z })
    }));

    graph.addTable(table);

    run('set t x(unique) y=yone z=zone');
    expect(inserts).toEqual([{
        xUnique: true, y: 'yone', z: 'zone'
    }]);

    run('set t x=xtwo y(unique) z=ztwo');
    expect(inserts).toEqual([{
        xUnique: true, y: 'yone', z: 'zone'
    },{
        yUnique: true, x: 'xtwo', z: 'ztwo'
    }]);
})

it(`insert(unique) doesn't trigger if an input is missing`, () => {
    const { run, graph } = setupGraph();

    const table = new TableMount('test', parseTuple('t(key) x(key) y'));
    graph.addTable(table);

    table.addHandler('insert', 'x(unique) y', unwrapTuple(({y, z}) => {
        expect('not called').toEqual(true);
    }));

    expect.assertions(1);

    try {
        const result = run('set t x')
        result.rel().rethrow();
    } catch (err) {
        expect(err.message).toEqual(`Table test doesn't support: insert t x`);
    }
});


import Graph from '../Graph'
import LiveQuery from '../LiveQuery'
import Query from '../Query';
import { preset, setupGraph } from './utils';
import { receiveToRelationSync } from '../receiveUtils';
import parseTuple from '../stringFormat/parseTuple'

xit('triggers change events when a related query is modified', () => {
    const { run, graph } = setupGraph({
        provide: {
            'a v': 'memory',
            'b v': 'memory',
            'c v': 'memory',
            'a query': 'memory',
        }
    });
    preset(graph, [
        'a v=123',
        'a v=456',
        'b v=789',
        'b v=987',
    ]);

    let changeEvents = [];
    const liveQuery = new LiveQuery(graph, "get a v | get b v");
    liveQuery.onChange(evt => changeEvents.push(evt));

    expect(Array.from(liveQuery.runSync().body()).map(t => t.stringify())).toEqual([
        'a v/123',
        'a v/456',
        'b v/789',
        'b v/987'
    ]);
    expect(changeEvents.length).toEqual(0);

    liveQuery.runSync();
    liveQuery.runSync();
    liveQuery.runSync();
    liveQuery.runSync();
    expect(changeEvents.length).toEqual(0);

    run('set a v=333');

    expect(changeEvents.length).toEqual(1);
    changeEvents = [];
    expect(liveQuery.runSync().bodyArr().map(t => t.stringify())).toEqual([
        'a v/123',
        'a v/456',
        'a v/333',
        'b v/789',
        'b v/987'
    ]);

    run('set c v=123');
    expect(changeEvents.length).toEqual(0);

    run('delete b v=789');
    expect(changeEvents.length).toEqual(1);
    changeEvents = []
});

it("cleans up listeners on close", () => {
    const { graph, run } = setupGraph();
    graph.provide({
        'a b': 'memory'
    });
    const table = Array.from(graph.findMatchingTables('a b'))[0];
    expect(table.listeners.size).toEqual(0);

    const liveQuery = graph.newLiveQuery('get a b');

    expect(table.listeners.size).toEqual(1);

    liveQuery.close();

    expect(table.listeners.size).toEqual(0);
});

xit("correctly listens on a run-query", () => {
    const { graph, run } = setupGraph();
    graph.provide({
        'a b': 'memory'
    });

    run('set b v=999');
    run('set a query(get b v)');

    const liveQuery = graph.newLiveQuery('run-query a query');

    let latest = null;

    liveQuery.onUpdate(rel => { latest = rel });

    expect(latest.stringifyBody()).toEqual(`[b v/999]`);

    run('set b=1 v=888');

    expect(latest.stringifyBody()).toEqual(`[b v/999, b/1 v/888]`);
});

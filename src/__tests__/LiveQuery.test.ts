
import Graph from '../Graph'
import LiveQuery from '../LiveQuery'
import Query from '../Query';
import { run, preset } from './utils';
import { receiveToRelationSync } from '../Relation';
import parseTuple from '../stringFormat/parseTuple'

let graph: Graph;

beforeEach(() => {
    graph = new Graph();
});

it('triggers change events when a related query is modified', () => {
    preset(graph, [
        'a v/123',
        'a v/456',
        'b v/789',
        'b v/987',
    ]);

    let changeEvents = [];
    const liveQuery = new LiveQuery(graph, "get a v | get b v");
    liveQuery.onChange(evt => changeEvents.push(evt));

    expect(liveQuery.runSync().tuples.map(t => t.stringify())).toEqual([
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

    run(graph, 'set a v/333');

    expect(changeEvents.length).toEqual(1);
    changeEvents = [];
    expect(liveQuery.runSync().tuples.map(t => t.stringify())).toEqual([
        'a v/123',
        'a v/456',
        'a v/333',
        'b v/789',
        'b v/987'
    ]);

    run(graph, 'set c v/123');
    expect(changeEvents.length).toEqual(0);

    run(graph, 'delete b v/789');
    expect(changeEvents.length).toEqual(1);
    changeEvents = []
});

it("cleans up listeners on close", () => {
    const table = graph.defineInMemoryTable(name, parseTuple('a b'));
    expect(table.listeners.size).toEqual(0);

    const liveQuery = graph.newLiveQuery('get a b');

    expect(table.listeners.size).toEqual(1);

    liveQuery.close();

    expect(table.listeners.size).toEqual(0);
});

it("correctly listens on a run-query", () => {
    run(graph, 'set b v/999');
    run(graph, 'set a query(get b v)');

    const liveQuery = graph.newLiveQuery('run-query a query');

    let latest = null;

    liveQuery.onUpdate(rel => { latest = rel });

    expect(latest.stringifyBody()).toEqual(`[b v/999]`);

    run(graph, 'set b/1 v/888');

    expect(latest.stringifyBody()).toEqual(`[b v/999, b/1 v/888]`);
});

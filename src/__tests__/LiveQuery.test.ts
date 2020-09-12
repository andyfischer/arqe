
import Graph from '../Graph'
import LiveQuery from '../LiveQuery'
import QueryV2 from '../QueryV2';
import { parseProgram } from '../parseProgram';
import { run, preset } from './utils';
import { receiveToRelationSync } from '../Relation';

it('triggers change events when a related query is modified', () => {
    const graph = new Graph();

    preset(graph, [
        'a v/123',
        'a v/456',
        'b v/789',
        'b v/987',
    ]);

    let changeEvents = [];
    const query = parseProgram("get a v | get b v");
    const liveQuery = new LiveQuery(graph, query);
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

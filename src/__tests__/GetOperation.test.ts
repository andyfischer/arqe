
import Graph from '../Graph'
import GetOperation from '../GetOperation'
import parseCommand from '../parseCommand'

it('supports ** to match everything', () => {
    const graph = new Graph();

    graph.run('set a');
    graph.run('set a b == 4');

    expect(graph.runSync('get **')).toEqual([
        'a',
        'a b == 4'
    ]);
});

it("correctly looks down for inherit tags", () => {
    const graph = new Graph();
    graph.run('set typeinfo/branch .inherits');

    const sawSearches = [];
    graph.inMemory.runSearch = (get) => {
        sawSearches.push(get.pattern.stringify());
        get.finishSearch();
    }

    const get = new GetOperation(graph, parseCommand("get a b branch/1 branch/2"));
    get.outputToStringRespond(s => null);
    get.perform();

    expect(get.done).toEqual(true);
    expect(sawSearches).toEqual([
        "a b branch/1 branch/2",
        "a b branch/1",
        "a b branch/2",
        "a b"
    ]);
});


import Graph from '../Graph'
import GetOperation from '../GetOperation'
import CommandExecution from '../CommandExecution'
import parseCommand from '../parseCommand'

it('works', () => {
});
/*
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

    const commandExec = new CommandExecution(graph, parseCommand("get a b branch/1 branch/2"));
    commandExec.outputToStringRespond(s => null);
    const get = new GetOperation(graph, commandExec);
    get.run();

    expect(get.done).toEqual(true);
    expect(sawSearches).toEqual([
        "a b branch/1 branch/2",
        "a b branch/1",
        "a b"
    ]);
});

it("correctly looks down for multiple inherit tag types", () => {
    const graph = new Graph();
    graph.run('set typeinfo/a-branch .inherits');
    graph.run('set typeinfo/b-branch .inherits');
    graph.run('set typeinfo/c-branch .inherits');
    graph.run('set typeinfo/d-branch .inherits');

    const sawSearches = [];
    graph.inMemory.runSearch = (get) => {
        sawSearches.push(get.pattern.stringify());
        get.finishSearch();
    }

    const commandExec = new CommandExecution(graph, parseCommand("get a b a-branch b-branch c-branch/1 d-branch/2 d-branch/3"));
    const get = new GetOperation(graph, commandExec);
    commandExec.outputToStringRespond(s => null);
    get.run();

    expect(get.done).toEqual(true);
    expect(sawSearches).toEqual([
       "a b a-branch b-branch c-branch/1 d-branch/2 d-branch/3",
       "a b a-branch b-branch c-branch/1 d-branch/2",
       "a b a-branch b-branch c-branch/1",
       "a b a-branch b-branch",
       "a b a-branch",
       "a b",
    ]);
});
*/

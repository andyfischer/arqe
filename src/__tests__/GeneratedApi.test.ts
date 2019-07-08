
import Graph from '../Graph'
import GeneratedApi from './generated/GeneratedApi'

let graph: Graph;
let api: GeneratedApi;

beforeAll(() => {
    graph = new Graph();

    graph.runSync('set a/1 b/1');
    graph.runSync('set a flag/startingval');
    api = new GeneratedApi(graph);
});

it('supports getting a single tag', () => {
    expect(api.getOneTag()).toEqual('b/1');
});

it('supports getting a single tag value', () => {
    expect(api.getOneTagValue()).toEqual('1');
});

it('supports a delete & set piped query', () => {
    expect(api.getCurrentFlag('a')).toEqual('startingval');
    api.changeFlag('a', 'nextval');
    expect(api.getCurrentFlag('a')).toEqual('nextval');
});

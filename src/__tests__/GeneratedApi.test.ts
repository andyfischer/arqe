
import Graph from '../Graph'
import GeneratedApi from './generated/GeneratedApi'

let graph: Graph;
let api: GeneratedApi;

beforeAll(() => {
    graph = new Graph();

    graph.runSync('set a/1 b/1');
    api = new GeneratedApi(graph);
});

it('supports getting a single tag', () => {
    expect(api.getOneTag()).toEqual('b/1');
});

it('supports getting a single tag value', () => {
    expect(api.getOneTagValue()).toEqual('1');
});

it('supports a delete & set piped query', () => {
});

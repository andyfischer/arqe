import Graph from "../Graph"
import setupTableSet from "../setupTableSet";
import { unwrapTuple } from "../tuple/UnwrapTupleCallback";
import { run } from "./utils";
import QueryEvalHelper from "../QueryEvalHelper";
import { receiveToSingleValue } from "../receiveUtils";

let graph: Graph;

beforeEach(() => {
    graph = new Graph();
})

it('supports side queries using the evalHelper', () => {
    const val = graph.mountSingleValueTable('val', 'val', 'val')
    val.set(5);

    graph.provide({
        'result': {
            name: 'main',
            'get context.evalHelper': (input, out) => {
                const evalHelper: QueryEvalHelper = input.get('context.evalHelper');
                const [ val, stream ] = receiveToSingleValue('val')
                expect(evalHelper).toBeDefined();
                evalHelper.runQuery('get val', stream)
                out.done({ result: `val=${ val.get() }` });
            }
        }
    });

    expect(run(graph, 'get result')).toEqual(['result/val=5'])
    val.set(23);
    expect(run(graph, 'get result')).toEqual(['result/val=23'])
})

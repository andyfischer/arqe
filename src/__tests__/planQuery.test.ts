import planQuery from "../planQuery";
import parseTuple from "../parseTuple";
import findTableForQuery from "../findTableForQuery";
import { Graph } from "..";
import { receiveToTupleList } from "../receiveUtils";

it('correctly plans query for a delete', async () => {
    const graph = new Graph();
    await graph.runSync('set a');
    const out = receiveToTupleList(() => {});
    const plan = planQuery(graph, parseTuple('a deleted/(set)'), out);

    expect(plan.isDelete).toEqual(true);
    expect(plan.searchTables.length).toEqual(1);
    expect(findTableForQuery(graph, parseTuple('a'))).toBeDefined();
    expect(plan.searchTables[0].name).toEqual(findTableForQuery(graph, parseTuple('a')).name);
    expect(plan.searchTables[0]).toEqual(findTableForQuery(graph, parseTuple('a')));
});

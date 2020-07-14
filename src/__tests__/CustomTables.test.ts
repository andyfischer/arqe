import TableMount from "../TableMount"
import parseTuple from "../parseTuple";
import { Graph } from "..";
import { run } from './utils'
import { jsObjectHandler } from "../NativeHandler";

it('supports find-for handler', () => {
    const graph = new Graph();
    const table = new TableMount(name, parseTuple('t x? y?'));
    graph.addTable(table);
    table.addHandler("find-for x", jsObjectHandler(({ x }) => {
        return {
            x,
            y: parseInt(x) + 1
        }
    }));

    table.addHandler("find-for y", jsObjectHandler(({ y }) => {
        return {
            y,
            x: parseInt(y) - 1
        }
    }));

    expect(run(graph, "get t x/1 y")).toEqual(["t x/1 y/2"]);
    expect(run(graph, "get t x y/4")).toEqual(["t x/3 y/4"]);
});

it('supports find-all handler', () => {
    const graph = new Graph();
    const table = new TableMount(name, parseTuple('t x? y?'));
    graph.addTable(table);

    table.addHandler("find-all", jsObjectHandler(() => {
        return [
            { x: '1', y: '2' },
            { x: '5', y: '6' }
        ]
    }));

    expect(run(graph, "get t x y")).toEqual(["t x/1 y/2", "t x/5 y/6"]);

    // With filter:
    expect(run(graph, "get t x/1 y")).toEqual(["t x/1 y/2"]);
});
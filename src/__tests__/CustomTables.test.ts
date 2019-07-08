import TableMount from "../TableMount"
import parseTuple from "../parseTuple";
import { Graph } from "..";
import { run } from './utils'
import { jsObjectHandler } from "../NativeHandler";

it('supports searches with find-for', () => {
    const graph = new Graph();
    const table = new TableMount('custom1', parseTuple('t x? y?'));
    graph.addTable(table);
    table.addHandler("find-with x", jsObjectHandler(({ x }) => {
        return {
            x,
            y: parseInt(x) + 1
        }
    }));

    table.addHandler("find-with y", jsObjectHandler(({ y }) => {
        return {
            y,
            x: parseInt(y) - 1
        }
    }));

    expect(run(graph, "get t x/1 y")).toEqual(["t x/1 y/2"]);
    expect(run(graph, "get t x y/4")).toEqual(["t x/3 y/4"]);
});

it('supports searches with find-all', () => {
    const graph = new Graph();
    const table = new TableMount('custom2', parseTuple('t x? y?'));
    graph.addTable(table);

    table.addHandler("list-all", jsObjectHandler(() => {
        return [
            { x: '1', y: '2' },
            { x: '5', y: '6' }
        ]
    }));

    expect(run(graph, "get t x y")).toEqual(["t x/1 y/2", "t x/5 y/6"]);

    // With filter:
    expect(run(graph, "get t x/1 y")).toEqual(["t x/1 y/2"]);
});

it('supports custom inserts', () => {
    const graph = new Graph();
    const table = new TableMount('custom3', parseTuple('t x? y?'));
    graph.addTable(table);

    const data = {
        'a': '1',
        'b': '2'
    }

    table.addHandler("find-with x", jsObjectHandler(({ x }) => {
        return {
            x,
            y: data[x]
        }
    }));

    table.addHandler('set x y', jsObjectHandler(({x,y}) => {
        data[x] = y;
        return { x, y };
    }))

    expect(run(graph, "get t x/a y")).toEqual(["t x/a y/1"]);
    expect(run(graph, "set t x/a y/2")).toEqual(["t x/a y/2"]);
    expect(run(graph, "get t x/a y")).toEqual(["t x/a y/2"]);
});
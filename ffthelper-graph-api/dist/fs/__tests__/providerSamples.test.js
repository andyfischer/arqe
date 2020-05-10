"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Graph_1 = __importDefault(require("../Graph"));
const UpdateContext_1 = require("../UpdateContext");
it('test with getRelations', () => {
    const graph = new Graph_1.default();
    graph.run('set a b/123');
    graph.run('set a b/456');
    const result = UpdateContext_1.runUpdateOnce(graph, cxt => {
        const out = [];
        for (const rel of cxt.getRelations("a b/*")) {
            out.push(rel.getTagValue("b"));
        }
        return out;
    });
    expect(result).toEqual(['123', '456']);
});
it('test with getOptionsObject', () => {
    const graph = new Graph_1.default();
    graph.run('set a b/123');
    graph.run('set a b/123 .foo == bee');
    graph.run('set a b/456');
    graph.run('set a b/456 .opt1 == bar');
    graph.run('set a b/456 .opt2 == zee');
    const result = UpdateContext_1.runUpdateOnce(graph, cxt => {
        const out = {};
        for (const rel of cxt.getRelations("a b/*")) {
            out[rel.getTagValue("b")] = cxt.getOptionsObject(rel.stringify());
        }
        return out;
    });
    expect(result).toEqual({
        123: {
            foo: 'bee'
        },
        456: {
            opt1: 'bar',
            opt2: 'zee'
        }
    });
});

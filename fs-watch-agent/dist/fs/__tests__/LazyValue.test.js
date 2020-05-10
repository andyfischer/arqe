"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Graph_1 = __importDefault(require("../Graph"));
const LazyValue_1 = __importDefault(require("../LazyValue"));
let graph;
let cachedValue;
let callCount = 0;
beforeEach(() => {
    graph = new Graph_1.default();
    callCount = 0;
    cachedValue = new LazyValue_1.default(graph, cxt => {
        callCount += 1;
        const rels = cxt.getRelations("string/*");
        rels.sort((a, b) => a.getTagValue('string')
            .localeCompare(b.getTagValue('string')));
        let strs = rels.map(r => r.getPayload());
        for (const ignore of cxt.getRelations("ignorestring/*")) {
            strs = strs.filter(s => s !== ignore.getPayload());
        }
        return strs.join(' ');
    });
    graph.runSilent('set string/1 == apple');
    graph.runSilent('set string/2 == banana');
});
it('uses the correct initial value', () => {
    const val = cachedValue.get();
    expect(val).toEqual('apple banana');
});
it("doesn't recompute if there are no changes", () => {
    cachedValue.get();
    cachedValue.get();
    const val = cachedValue.get();
    expect(callCount).toEqual(1);
    expect(val).toEqual('apple banana');
});
it("recomputes if there are related changes", () => {
    expect(cachedValue.get()).toEqual('apple banana');
    graph.runSilent('set string/3 == cheese');
    expect(cachedValue.get()).toEqual('apple banana cheese');
    graph.runSilent('delete string/2 == cheese');
    expect(cachedValue.get()).toEqual('apple cheese');
});
it('handles updates to multiple queries', () => {
    graph.runSilent('set ignorestring/1 == apple');
    expect(cachedValue.get()).toEqual('banana');
    graph.runSilent('set string/4 == danish');
    expect(cachedValue.get()).toEqual('banana danish');
    graph.runSilent('set ignorestring/2 == danish');
    expect(cachedValue.get()).toEqual('banana');
});
//# sourceMappingURL=LazyValue.test.js.map
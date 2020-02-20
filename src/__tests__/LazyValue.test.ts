
import Graph from '../Graph'
import LazyValue from '../LazyValue'

let graph;
let cachedValue: LazyValue<string>
let callCount = 0;

beforeEach(() => {
    graph = new Graph();
    callCount = 0;
    cachedValue = new LazyValue(graph, cxt => {

        // Concatenate a bunch of strings
        callCount += 1;
        const rels = cxt.getRelations("string/*");
        rels.sort((a,b) => (a.getTagValue('string') as string)
                    .localeCompare(b.getTagValue('string') as string));

        let strs = rels.map(r => r.getPayload());

        // Just to add complication, delete strings from ignorestring/* tags.
        for (const ignore of cxt.getRelations("ignorestring/*")) {
            strs = strs.filter(s => s !== ignore.getPayload());
        }

        return strs.join(' ');
    });

    graph.run('set string/1 == apple');
    graph.run('set string/2 == banana');
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

    graph.run('set string/3 == cheese');
    expect(cachedValue.get()).toEqual('apple banana cheese');

    graph.run('delete string/2 == cheese');
    expect(cachedValue.get()).toEqual('apple cheese');
});

it('handles updates to multiple queries', () => {

    graph.run('set ignorestring/1 == apple');
    expect(cachedValue.get()).toEqual('banana');

    graph.run('set string/4 == danish')

    expect(cachedValue.get()).toEqual('banana danish');

    graph.run('set ignorestring/2 == danish');

    expect(cachedValue.get()).toEqual('banana');
});

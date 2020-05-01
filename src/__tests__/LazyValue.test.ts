
import Graph from '../Graph'
import LazyValue from '../LazyValue'

let graph: Graph;
let cachedValue: LazyValue<string>
let callCount = 0;

beforeEach(() => {
    graph = new Graph();
    callCount = 0;
    cachedValue = new LazyValue(graph, cxt => {

        // Concatenate a bunch of strings
        callCount += 1;
        const rels = cxt.getRelations("string/* value/*");
        rels.sort((a,b) => (a.getTagValue('string') as string)
                    .localeCompare(b.getTagValue('string') as string));

        let strs = rels.map(r => r.getTagValue('value'));

        // Just to add complication, delete strings from ignorestring/* tags.
        for (const ignore of cxt.getRelations("ignorestring/* value/*")) {
            strs = strs.filter(s => s !== ignore.getTagValue('value'));
        }

        return strs.join(' ');
    });

    graph.runSilent('set string/1 value(apple)');
    graph.runSilent('set string/2 value(banana)');
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

    graph.runSilent('set string/3 value(cheese)');
    expect(cachedValue.get()).toEqual('apple banana cheese');

    graph.runSilent('delete string/2 value');
    expect(cachedValue.get()).toEqual('apple cheese');
});

it('handles updates to multiple queries', () => {

    graph.runSilent('set ignorestring/1 value(apple)');
    expect(cachedValue.get()).toEqual('banana');

    graph.runSilent('set string/4 value(danish)')

    expect(cachedValue.get()).toEqual('banana danish');

    graph.runSilent('set ignorestring/2 value(danish)');

    expect(cachedValue.get()).toEqual('banana');
});

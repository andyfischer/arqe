import Pipe from "../utils/Pipe"
import parseTuple from "../stringFormat/parseTuple";
import Tuple from "../Tuple";

xit('disabled', () => {

})
/*
it('tuple handler can return a single tuple', () => {
    const out = new Pipe();

    callNativeHandler(tupleHandler((t: Tuple) => {
        return t.setVal("c", 1);
    }), parseTuple("a b"), out);

    expect(out.take().map(t => t.stringify())).toEqual(['a b c/1'])
})

it('tuple handler can return a list of tuples', () => {
    const out = new Pipe();
    callNativeHandler(tupleHandler((t: Tuple) => {
        return [
            t.setVal("c", 1),
            t.setVal("c", 2)
        ];
    }), parseTuple("a b"), out);

    expect(out.take().map(t => t.stringify())).toEqual(['a b c/1', 'a b c/2'])
})

it('tuple handler can return a tuple promise', async () => {
    const out = new Pipe();
    let resolveInput;

    callNativeHandler(tupleHandler(async (t: Tuple) => {
        const input = await new Promise((resolve) => {
            resolveInput = resolve;
        });

        return t.setVal("c", input);
    }), parseTuple("a b"), out);

    expect(out.take()).toEqual([]);

    resolveInput(5);
    await new Promise((resolve) => setImmediate(resolve));
    expect(out.take().map(t => t.stringify())).toEqual(['a b c/5'])
})

it('tuple handler can return a tuple list promise', async () => {

    const out = new Pipe();
    let resolveInput;

    callNativeHandler(tupleHandler(async (t: Tuple) => {
        const input = await new Promise((resolve) => {
            resolveInput = resolve;
        });

        return [
            t.setVal("c", input),
            t.setVal("c", input)
        ]
    }), parseTuple("a b"), out);

    expect(out.take()).toEqual([]);

    resolveInput(9);
    await new Promise((resolve) => setImmediate(resolve));
    expect(out.take().map(t => t.stringify())).toEqual(['a b c/9', 'a b c/9'])
})
*/

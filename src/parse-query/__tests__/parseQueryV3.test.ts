
import { parseSingleLine } from '../parseQueryV3'

async function parse(text: string) {
    const exprs = [];

    await parseSingleLine({
        text,
        onExpr: (e) => {
            exprs.push(e);
        },
        onProgress: async (e) => null
    });

    return exprs;
}

it('parses simple queries', async () => {
    const exprs = await parse("command a=b c");
    expect(exprs.length).toEqual(1)
    expect(exprs[0].type).toEqual('simple')
    expect(exprs[0].args.length).toEqual(3);
    expect(exprs[0].args[0].keyword).toEqual('command');
    expect(exprs[0].args[1].lhsName).toEqual('a');
    expect(exprs[0].args[1].rhsValue).toEqual('b');
    expect(exprs[0].args[2].keyword).toEqual('c');
});

it('parses bar pipes', async () => {
    const exprs = await parse("command a | command b");
    expect(exprs[0].type).toEqual('simple')
    expect(exprs[0].originalStr).toEqual("command a")
    expect(exprs[1].type).toEqual('simple')
    expect(exprs[1].originalStr).toEqual("command b")
    expect(exprs[2].type).toEqual('pipe')
    expect(exprs[2].originalStr).toEqual("command a | command b")
    expect(exprs.length).toEqual(3)
});


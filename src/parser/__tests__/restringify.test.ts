
import parseTuple from '../parseTuple'

function tupleRestringify(str: string) {
    const restringified = parseTuple(str).stringify();
    expect(restringified).toEqual(str);
}

it("restringify simple exaples", () => {
    tupleRestringify("a");
    tupleRestringify("a b");
    tupleRestringify("a/1");
    tupleRestringify("a(hello there)");
});

it('handles paren sections', () => {
    tupleRestringify('get tag(string value)');
    tupleRestringify('get tag(a/1 b/2 c/3)');
    tupleRestringify(`git branch(* branch_name)`);
});

it('handles bracket quoting', () => {
    // tupleRestringify(`get message[can't use dir(*)]`);
});

it('stringifies expressions', () => {
    tupleRestringify('set a(increment)');
});


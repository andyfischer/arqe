import Pipe from "../Pipe"
import { streamPostRemoveAttr, streamPostModify } from "../StreamUtil";
import parseTuple from "../parseTuple";
import { stringify } from "querystring";

it("streamPostRemoveAttr works", () => {
    const input = new Pipe();
    const output = new Pipe();

    input.sendTo(streamPostRemoveAttr(output, "x"));

    input.next(parseTuple("x y z"))
    input.next(parseTuple("a b c"))
    input.next(parseTuple("x y"))
    input.next(parseTuple("x"))

    expect(output.take().map(t => t.stringify())).toEqual([
        "y z",
        "a b c",
        "y"
    ]);
})
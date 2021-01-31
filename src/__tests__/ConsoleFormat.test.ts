import { consoleFormatRelation } from "../console/formatRelation";
import { setupGraph } from "./utils";
import parseTuple from '../stringFormat/parseTuple'

it("correctly formats a simple relation", () => {
  const { run } = setupGraph({
    provide: {
      "a b": "val a/1 b/2"
    }
  });

  expect(consoleFormatRelation(run("get a b").rel())).toMatchInlineSnapshot(`
            Array [
              "  a ┃ b",
              "  ━━╋━━",
              "  1 ┃ 2",
            ]
      `);
});

it("correctly formats various values", () => {
  const { run } = setupGraph({
    provide: {
      val: (i, o) => {
        o.next({ val: true });
        o.next({ val: false });
        o.next({ val: 1 });
        o.next({ val: "string" });
        o.done();
      }
    }
  });

  expect(consoleFormatRelation(run("get val").rel())).toMatchInlineSnapshot(`
    Array [
      "  val/true",
      "  val/false",
      "  val/1",
      "  val/string",
    ]
  `);
});

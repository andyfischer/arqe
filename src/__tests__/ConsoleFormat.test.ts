import { consoleFormatRelation } from "../console/formatRelation";
import { setupGraph } from "./utils";
import parseTuple from "../stringFormat/parseTuple";

it("correctly formats relations", () => {
  const { run } = setupGraph({
    provide: {
      "a b": "val a/1 b/2"
    }
  });

  expect(consoleFormatRelation(run("get a b | just a").rel()))
    .toMatchInlineSnapshot(`
            Array [
              "  a/1",
            ]
      `);

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

it("handles results with mixed schemas", () => {
  const { run } = setupGraph({
    provide: {
      "a b": "val a=1 b=2",
      "b c": "val b=2 c=3",
      d: "val d=4"
    }
  });

  expect(consoleFormatRelation(run("get a b | get b c | get d").rel()))
    .toMatchInlineSnapshot(`
    Array [
      "  a ┃ b ┃ c ┃ d",
      "  ━━╋━━━╋━━━╋━━",
      "  1 ┃ 2 ┃   ┃  ",
      "    ┃ 2 ┃ 3 ┃  ",
      "    ┃   ┃   ┃ 4",
    ]
  `);
});

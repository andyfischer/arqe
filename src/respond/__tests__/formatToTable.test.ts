import formatToTable from "../formatToTable";

it("handles a singular dataset", () => {
  const data = [{ field: 123 }];
  expect(formatToTable(data)).toMatchInlineSnapshot(`
            "
            Field
            -----
             123 "
      `);
});

it("handles a multi-field dataset", () => {
  const data = [{ field: 123, field2: 456, field3: "the value" }];
  expect(formatToTable(data)).toMatchInlineSnapshot(`
    "
    Field | Field2 |  Field3  
    ----- | ------ | ---------
     123  |  456   | the value"
  `);
});

it("handles a multi-row dataset", () => {
  const data = [
    { field: 123, field2: 456, field3: "the value" },
    { field: 999, field2: 1, field3: "another value" }
  ];
  expect(formatToTable(data)).toMatchInlineSnapshot(`
    "
    Field | Field2 |    Field3    
    ----- | ------ | -------------
     123  |  456   |   the value  
     999  |   1    | another value"
  `);
});

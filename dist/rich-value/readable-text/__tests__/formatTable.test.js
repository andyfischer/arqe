"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const formatTable_1 = __importDefault(require("../formatTable"));
it("handles a singular dataset", () => {
    const data = [{ field: 123 }];
    expect(formatTable_1.default(data)).toMatchInlineSnapshot(`
    "Field
    -----
     123 "
  `);
});
it("handles a multi-field dataset", () => {
    const data = [{ field: 123, field2: 456, field3: "the value" }];
    expect(formatTable_1.default(data)).toMatchInlineSnapshot(`
    "Field | Field2 |  Field3  
    ----- | ------ | ---------
     123  |  456   | the value"
  `);
});
it("handles a multi-row dataset", () => {
    const data = [
        { field: 123, field2: 456, field3: "the value" },
        { field: 999, field2: 1, field3: "another value" }
    ];
    expect(formatTable_1.default(data)).toMatchInlineSnapshot(`
    "Field | Field2 |    Field3    
    ----- | ------ | -------------
     123  |  456   |   the value  
     999  |   1    | another value"
  `);
});
//# sourceMappingURL=formatTable.test.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stringCoerce_1 = require("../stringCoerce");
describe("toIdentifier", () => {
    it("does nothing on strings that are fine", () => {
        expect(stringCoerce_1.toIdentifier("itsFine")).toEqual("itsFine");
    });
    it("fixes strings that have dashes", () => {
        expect(stringCoerce_1.toIdentifier("has-dash")).toEqual("hasDash");
    });
    it("fixes strings that have spaces", () => {
        expect(stringCoerce_1.toIdentifier("has space")).toEqual("hasSpace");
    });
});


import { toIdentifier } from '../stringCoerce'

describe("toIdentifier", () => {
    it("does nothing on strings that are fine", () => {
        expect(toIdentifier("itsFine")).toEqual("itsFine");
    });
    it("fixes strings that have dashes", () => {
        expect(toIdentifier("has-dash")).toEqual("hasDash");
    });
    it("fixes strings that have spaces", () => {
        expect(toIdentifier("has space")).toEqual("hasSpace");
    });
});

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const parseQueryV3_1 = require("../parseQueryV3");
function quickParse(text) {
    return __awaiter(this, void 0, void 0, function* () {
        const exprs = [];
        yield parseQueryV3_1.parseQueries({
            text,
            onExpr: (e) => {
                exprs.push(e);
            },
            onProgress: (e) => __awaiter(this, void 0, void 0, function* () { return null; })
        });
        return exprs;
    });
}
it('parses simple queries', () => __awaiter(this, void 0, void 0, function* () {
    const exprs = yield quickParse("command a=b c");
    expect(exprs.length).toEqual(1);
    expect(exprs[0].type).toEqual('simple');
    expect(exprs[0].args.length).toEqual(3);
    expect(exprs[0].args[0].keyword).toEqual('command');
    expect(exprs[0].args[1].lhsName).toEqual('a');
    expect(exprs[0].args[1].rhsValue).toEqual('b');
    expect(exprs[0].args[2].keyword).toEqual('c');
}));
it('parses bar pipes', () => __awaiter(this, void 0, void 0, function* () {
    const exprs = yield quickParse("command a | command b");
    expect(exprs[0].type).toEqual('simple');
    expect(exprs[0].originalStr).toEqual("command a");
    expect(exprs[1].type).toEqual('simple');
    expect(exprs[1].originalStr).toEqual("command b");
    expect(exprs[2].type).toEqual('pipe');
    expect(exprs[2].originalStr).toEqual("command a | command b");
    expect(exprs.length).toEqual(3);
}));
//# sourceMappingURL=parseQueryV3.test.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
describe('sourcePosToHere', () => {
    it('gives correct ranges', () => {
        const { iterator } = __1.tokenizeString("x yyy zzzzzzz");
        expect(iterator.toSourcePos(iterator.next(), iterator.next(2))).toEqual({
            columnEnd: 6,
            columnStart: 1,
            lineEnd: 1,
            lineStart: 1,
            posEnd: 5,
            posStart: 0,
        });
        expect(iterator.toSourcePos(iterator.next(2), iterator.next(5))).toEqual({
            columnEnd: 14,
            columnStart: 3,
            lineEnd: 1,
            lineStart: 1,
            posEnd: 13,
            posStart: 2,
        });
    });
});
describe('tokenizeString', () => {
    it('gives correct results', () => {
        const { iterator } = __1.tokenizeString("apple banana cinnamon");
        expect(iterator.next().match).toEqual(__1.t_ident);
        expect(iterator.nextIs(__1.t_ident)).toBeTruthy();
        expect(iterator.finished()).toBeFalsy();
        iterator.consume(__1.t_ident);
        expect(iterator.next().match).toEqual(__1.t_space);
        expect(iterator.nextIs(__1.t_space)).toBeTruthy();
        expect(iterator.finished()).toBeFalsy();
        iterator.consume(__1.t_space);
        expect(iterator.next().match).toEqual(__1.t_ident);
        expect(iterator.nextIs(__1.t_ident)).toBeTruthy();
        expect(iterator.finished()).toBeFalsy();
        iterator.consume(__1.t_ident);
        iterator.consume(__1.t_space);
        iterator.consume(__1.t_ident);
        expect(iterator.next().match).not.toEqual(__1.t_ident);
        expect(iterator.nextIs(__1.t_ident)).toBeFalsy();
        expect(iterator.finished()).toBeTruthy();
    });
});

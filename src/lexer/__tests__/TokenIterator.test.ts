
import TokenIterator from '../TokenIterator'
import { t_ident, t_space, tokenizeString } from '..';

describe('sourcePosToHere', () => {
    it('gives correct ranges', () => {
        const { iterator } = tokenizeString("x yyy zzzzzzz");

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
        const { iterator } = tokenizeString("apple banana cinnamon");

        expect(iterator.next().match).toEqual(t_ident);
        expect(iterator.nextIs(t_ident)).toBeTruthy();
        expect(iterator.finished()).toBeFalsy();
        iterator.consume(t_ident);
        expect(iterator.next().match).toEqual(t_space);
        expect(iterator.nextIs(t_space)).toBeTruthy();
        expect(iterator.finished()).toBeFalsy();
        iterator.consume(t_space);
        expect(iterator.next().match).toEqual(t_ident);
        expect(iterator.nextIs(t_ident)).toBeTruthy();
        expect(iterator.finished()).toBeFalsy();
        iterator.consume(t_ident);
        iterator.consume(t_space);
        iterator.consume(t_ident);
        expect(iterator.next().match).not.toEqual(t_ident);
        expect(iterator.nextIs(t_ident)).toBeFalsy();
        expect(iterator.finished()).toBeTruthy();
    });
});


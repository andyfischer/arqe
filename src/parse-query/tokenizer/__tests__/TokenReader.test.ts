
import { t_ident, t_space, tokenizeString } from '..';

describe('TokenReader', () => {
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

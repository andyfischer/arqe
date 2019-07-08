
import { t_ident, t_space, tokenizeString } from '..';

describe('TokenReader', () => {
    it('gives correct results', () => {
        const { reader } = tokenizeString("apple banana cinnamon");

        expect(reader.next().match).toEqual(t_ident);
        expect(reader.nextIs(t_ident)).toBeTruthy();
        expect(reader.finished()).toBeFalsy();
        reader.consume(t_ident);
        expect(reader.next().match).toEqual(t_space);
        expect(reader.nextIs(t_space)).toBeTruthy();
        expect(reader.finished()).toBeFalsy();
        reader.consume(t_space);
        expect(reader.next().match).toEqual(t_ident);
        expect(reader.nextIs(t_ident)).toBeTruthy();
        expect(reader.finished()).toBeFalsy();
        reader.consume(t_ident);
        reader.consume(t_space);
        reader.consume(t_ident);
        expect(reader.next().match).not.toEqual(t_ident);
        expect(reader.nextIs(t_ident)).toBeFalsy();
        expect(reader.finished()).toBeTruthy();
    });
});

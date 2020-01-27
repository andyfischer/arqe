
import { inheritPowerSet } from '../findAllMatches'

describe('inheritPowerSet', () => {
    it("works", () => {
        expect(Array.from(inheritPowerSet([1,2,3]))).toEqual([
            [3],
            [2],
            [3,2],
            [1],
            [3,1],
            [2,1],
            [3,2,1]
        ]);

        expect(Array.from(inheritPowerSet([]))).toEqual([]);
    });
});

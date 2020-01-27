
import Schema from '../Schema'
import { commandToRelationPattern } from '../RelationPattern'

describe('patternWithoutType', () => {
    it('works', () => {
        const pattern = commandToRelationPattern("get a b/123 branch/1");
        expect(pattern.stringify()).toEqual("a b/123 branch/1");
        const pattern2 = pattern.patternWithoutType("branch");
        expect(pattern2.stringify()).toEqual("a b/123");
    });
});

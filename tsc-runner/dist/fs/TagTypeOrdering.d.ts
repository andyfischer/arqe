import UpdateContext from './UpdateContext';
import { PatternTag } from './RelationPattern';
export default class TagTypeOrdering {
    section: {};
    compareTagTypes(a: string, b: string): number;
    sortTags(tags: PatternTag[]): PatternTag[];
    update: (cxt: UpdateContext) => void;
}

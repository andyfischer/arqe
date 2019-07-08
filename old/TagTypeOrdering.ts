
import Relation from './Relation'
import UpdateContext from './UpdateContext'
import TupleTag from './TupleTag'

const beforeSection = 1
const unknownSection = 2
const afterSection = 3

export default class TagTypeOrdering {

    section = {}

    compareTagTypes(a: string, b: string) {
        const aSection = this.section[a] || unknownSection;
        const bSection = this.section[b] || unknownSection;

        if (aSection !== bSection)
            return (aSection < bSection) ? -1 : 1;

        return a.localeCompare(b);
    }

    sortTags(tags: TupleTag[]) {
        tags.sort((a: TupleTag, b: TupleTag) => {
            return this.compareTagTypes(a.tagType, b.tagType);
        });

        return tags;
    }

    update = (cxt: UpdateContext) => {
        for (const rel of cxt.getRelations('typeinfo/* option/order')) {

            const typeName = rel.getTagValue('typeinfo') as string;
            const value = rel.getTagValue('value');

            if (value === 'before') {
                this.section[typeName] = beforeSection
            } else if (value === 'after') {
                this.section[typeName] = afterSection;
            } else {
                throw new Error('invalid typeinfo order: ' + value);
            }
        }
    }
}

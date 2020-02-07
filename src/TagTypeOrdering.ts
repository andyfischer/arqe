
import Relation from './Relation'
import UpdateContext from './UpdateContext'

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

    update = (cxt: UpdateContext) => {
        for (const rel of cxt.getRelations('typeinfo/* option/order')) {

            const typeName = rel.getTagValue('typeinfo') as string;
            const value = rel.payload();

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


import Relation from './Relation'

const beforeSection = 1
const unknownSection = 2
const afterSection = 3

export default class TagTypeOrdering {

    section = {}

    updateInfo(rel: Relation) {
        if (!rel.has('typeinfo'))
            throw new Error('expected "typeinfo" relation');

        const typeName = rel.get('typeinfo');
        const value = rel.payloadStr;

        if (value === 'before') {
            this.section[typeName] = beforeSection
        } else if (value === 'after') {
            this.section[typeName] = afterSection;
        } else {
            throw new Error('invalid typeinfo order: ' + value);
        }
    }

    compareTagTypes(a: string, b: string) {
        const aSection = this.section[a] || unknownSection;
        const bSection = this.section[b] || unknownSection;

        if (aSection !== bSection)
            return (aSection < bSection) ? -1 : 1;

        return a.localeCompare(b);
    }
}

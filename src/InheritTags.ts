
import UpdateContext from './UpdateContext'

export default class InheritTags {

    anyFound: boolean = false
    byTypeName: { [ typeName: string]: true } = {}
}

export function updateInheritTags(cxt: UpdateContext) {

    const tags = new InheritTags();

    for (const rel of cxt.getTuples('typeinfo/* option/inherits')) {
        tags.anyFound = true;
        tags.byTypeName[rel.getVal('typeinfo') as string] = true;
    }

    return tags;
}

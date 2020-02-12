
import UpdateContext from './UpdateContext'

export default class InheritTags {

    anyFound: boolean = false
    byTypeName: { [ typeName: string]: true } = {}
}

export function updateInheritTags(cxt: UpdateContext) {

    const tags = new InheritTags();

    for (const rel of cxt.getRelations('typeinfo/* option/inherits')) {
        tags.anyFound = true;
        tags.byTypeName[rel.getTagValue('typeinfo') as string] = true;
    }

    return tags;
}

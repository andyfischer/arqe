
import UpdateContext from './UpdateContext'

export default function updateInheritTags(cxt: UpdateContext) {

    const found: { [typename: string]: true } = {};

    for (const rel of cxt.getRelations('typeinfo/* option/inherits')) {
        found[rel.getTagValue('typeinfo') as string] = true;
    }

    return found;
}

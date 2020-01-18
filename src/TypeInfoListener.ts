
import Command from './Command'
import Relation from './Relation'

export default class TypeInfoPlugin {
    name = 'TypeInfo'

    onRelationUpdated(command: Command, rel: Relation) {
        if (!rel.has('typeinfo'))
            return;

        const schema = rel.graph.schema;

        const tagType = schema.findTagType(rel.get('typeinfo'))

        if (rel.getOptional('option', null) === 'inherits') {
            tagType.inherits = true;
            return;
        }
        
        if (rel.getOptional('option', null) === 'order') {
            schema.ordering.updateInfo(rel);
            return;
        }
    }
}

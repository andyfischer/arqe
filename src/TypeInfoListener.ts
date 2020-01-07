
import Command from './Command'
import Relation from './Relation'

export default class TypeInfoPlugin {
    name = 'TypeInfo'

    onRelationUpdated(command: Command, rel: Relation) {
        if (!rel.has('typeinfo'))
            return;

        const graph = rel.graph;

        const tagType = graph.findTagType(rel.get('typeinfo'))

        if (rel.getOptional('option', null) === 'inherits') {
            tagType.inherits = true;
            return;
        }
        
        if (rel.getOptional('option', null) === 'order') {
            graph.ordering.updateInfo(rel);
            return;
        }
    }
}

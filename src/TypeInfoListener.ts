
import Command from './Command'
import Relation from './Relation'
import Schema from './Schema'

export default class TypeInfoPlugin {
    schema: Schema

    constructor(schema: Schema) {
        this.schema = schema;
    }

    onRelationUpdated(command: Command, rel: Relation) {
        if (!rel.has('typeinfo'))
            return;

        const tagType = this.schema.findTagType(rel.get('typeinfo'))

        if (rel.getOptional('option', null) === 'inherits') {
            tagType.inherits = true;
            return;
        }
        
        if (rel.getOptional('option', null) === 'order') {
            this.schema.ordering.updateInfo(rel);
            return;
        }
    }
}

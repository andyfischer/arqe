import Command from './Command';
import Relation from './Relation';
import Schema from './Schema';
export default class TypeInfoPlugin {
    schema: Schema;
    constructor(schema: Schema);
    onRelationUpdated(command: Command, rel: Relation): void;
}

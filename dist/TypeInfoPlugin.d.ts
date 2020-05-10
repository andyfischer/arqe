import GraphPlugin from './GraphPlugin';
import Command from './Command';
import Relation from './Relation';
export default class TypeInfoPlugin implements GraphPlugin {
    name: string;
    afterRelationUpdated(command: Command, rel: Relation): void;
}

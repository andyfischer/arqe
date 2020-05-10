import Command from './Command';
import Relation from './Relation';
export default interface Plugin {
    name: string;
    onRelationUpdated?: (command: Command, rel: Relation) => void;
}

import Command from './Command';
import Relation from './Relation';
import RelationPattern from './RelationPattern';
export default interface DataProvider {
    findAllMatches: (pattern: RelationPattern) => any;
    save: (command: Command) => Relation;
}

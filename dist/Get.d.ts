import Command, { CommandTag } from './Command';
import Graph from './Graph';
import Relation from './Relation';
import RelationPattern from './RelationPattern';
export default class Get {
    graph: Graph;
    command: Command;
    pattern: RelationPattern;
    constructor(graph: Graph, command: Command);
    hasListResult(): boolean;
    matchingFullSearch(): Generator<Relation, void, unknown>;
    findExactMatch(args: CommandTag[]): Relation | null;
    findOneMatch(): Relation;
    matchingRelations(): Generator<Relation, void, unknown>;
    formattedListResult(): string;
    extendedResult(): any;
    formattedSingleResult(): any;
    formattedResult(): string;
}

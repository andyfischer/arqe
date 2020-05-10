import Graph from '../Graph';
import Relation from '../Relation';
import RelationReceiver from '../RelationReceiver';
import Pattern from '../Pattern';
import StorageSlotHook from '../StorageSlotHook';
import Slot from '../Slot';
declare class GitHooks implements StorageSlotHook {
    graph: Graph;
    constructor(graph: Graph);
    hookPattern(pattern: Pattern): boolean;
    saveNewRelation(relation: Relation, output: RelationReceiver): void;
    iterateSlots(pattern: Pattern): Iterable<Slot>;
}
export default function setupGitHooks(graph: Graph): GitHooks;
export {};

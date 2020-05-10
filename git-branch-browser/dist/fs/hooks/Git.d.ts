import Graph from '../Graph';
import Relation from '../Relation';
import RelationReceiver from '../RelationReceiver';
import Pattern from '../Pattern';
import StorageSlotHook from '../StorageSlotHook';
import SlotReceiver from '../SlotReceiver';
declare class GitHooks implements StorageSlotHook {
    graph: Graph;
    constructor(graph: Graph);
    hookPattern(pattern: Pattern): boolean;
    saveNewRelation(relation: Relation, output: RelationReceiver): void;
    iterateSlots(pattern: Pattern, output: SlotReceiver): boolean;
}
export default function setupGitHooks(graph: Graph): GitHooks;
export {};

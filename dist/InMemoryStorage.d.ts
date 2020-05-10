import Relation from './Relation';
import Pattern from './Pattern';
import RelationReceiver from './RelationReceiver';
import Graph from './Graph';
import IDSource from './utils/IDSource';
import StorageSlotHook from './StorageSlotHook';
import SlotReceiver from './SlotReceiver';
export default class InMemoryStorage implements StorageSlotHook {
    graph: Graph;
    nextUniqueIdPerType: {
        [typeName: string]: IDSource;
    };
    slots: {
        [slotId: string]: Relation;
    };
    nextSlotId: IDSource;
    byImpliedTableName: {
        [tn: string]: {
            [slotId: string]: true;
        };
    };
    constructor(graph: Graph);
    resolveExpressionValues(rel: Relation): Pattern;
    findStored(search: Pattern): Iterable<{
        slotId: string;
        relation: Relation;
    }>;
    hookPattern(pattern: Pattern): boolean;
    saveNewRelation(relation: Relation, output: RelationReceiver): void;
    iterateSlots(pattern: Pattern, output: SlotReceiver): void;
}

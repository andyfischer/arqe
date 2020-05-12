
import Graph from './Graph'
import RelationReceiver from './RelationReceiver'
import PatternTag from './PatternTag'
import Relation from './Relation'
import Pattern from './Pattern'

type CommandType = 'save' | 'search'

export interface StorageProvider2 {
    useForPattern: (pattern: Pattern) => boolean
    resolveUniqueTag?: (tag: PatternTag) => PatternTag
    saveNewRelation2: (relation: Relation, output: RelationReceiver) => void
    getRelations: (pattern: Pattern, output: RelationReceiver) => void
}

const exprFuncEffects = {
    increment: {
        modifiesExisting: true,
        canInitialize: false
    },
    set: {
        modifiesExisting: true,
        canInitialize: true
    }
};

export default class CompiledQuery {
    // Initial inputs
    graph: Graph
    commandType: CommandType
    pattern: Pattern
    output: RelationReceiver

    // Derived information about the query
    modifiesExistingSlot: boolean
    initializesNewSlot: boolean
    initializesNewSlotIfNoneFound: boolean

    // Storage provider information
    storage: StorageProvider2

    constructor(graph: Graph, commandType: CommandType, pattern: Pattern, output: RelationReceiver) {
        this.graph = graph;
        this.commandType = commandType;
        this.pattern = pattern;
        this.output = output;

        this.checkExpressions();
    }

    checkExpressions() {
        this.modifiesExistingSlot = false;

        let anyEffectsCantInitialize = false;

        for (const tag of this.pattern.tags) {
            const expr = tag.valueExpr;
            const tagEffects = expr && expr[0] && exprFuncEffects[expr[0]];

            if (tagEffects && tagEffects.modifiesExisting)
                this.modifiesExistingSlot = true;

            if (tagEffects && tagEffects.modifiesExisting && !tagEffects.canInitialize)
                anyEffectsCantInitialize = true;
        }

        if (this.modifiesExistingSlot && !anyEffectsCantInitialize)
            this.initializesNewSlotIfNoneFound = true;
    }
}

function runSave(query: CompiledQuery) {

    const storage: StorageProvider2 = query.graph.inMemory;

    const resolvedPattern = query.pattern.remapTags((tag: PatternTag) => {
        if (tag.valueExpr && tag.valueExpr[0] === 'unique') {
            return storage.resolveUniqueTag(tag);
        }

        if (tag.valueExpr && tag.valueExpr[0] === 'seconds-from-now') {
            const seconds = parseInt(tag.valueExpr[1]);
            return tag.setValue(Date.now() + (seconds * 1000) + '');
        }

        return tag;
    });

}

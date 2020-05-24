
import Graph from './Graph'
import Schema, { Column, ColumnType, ObjectColumn, ValueColumn, ViewColumn } from './Schema'
import Relation from './Relation'
import PatternTag from './PatternTag'
import { emitCommandError, emitCommandOutputFlags } from './CommandMeta'
import RelationReceiver from './RelationReceiver'
import Pattern from './Pattern'
import ValueDatabase from './ValueDatabase'
import QueryPlan, { QueryTag } from './QueryPlan'
import makeQueryPlan from './makeQueryPlan'

export class AttributeSet {
    data: { [key: string]: string } = {}

    set(key: string, value: string) {
        this.data[key] = value;
    }

    get(key: string) {
        return this.data[key];
    }
}

function sortIncomingTags(a: QueryTag, b: QueryTag) {
    if (a.type.sortPriority !== b.type.sortPriority)
        return a.type.sortPriority - b.type.sortPriority;

    return 0;
}

interface InsertOperation {
    relation: Relation
    output: RelationReceiver
}

interface UpdateOperation {
    pattern: Pattern
    output: RelationReceiver
}

interface SelectOperation {
    pattern: Pattern
    output: RelationReceiver
}

interface Slot {
    relation: Relation
}

export default class Database {

    graph: Graph
    schema: Schema

    objectStore: { [columnName: string]: { [ id: string ]: AttributeSet } } = {}
    multiObjectStore: { [objectkey: string]: AttributeSet } = {}

    valueDatabase: ValueDatabase

    constructor(graph: Graph) {
        this.graph = graph;
        this.schema = new Schema();
        this.valueDatabase = new ValueDatabase(this);
    }

    checkValidation(plan: QueryPlan) {
        if (plan.views.length > 2) {
            emitCommandError(plan.output, "query has multiple views");
            plan.output.finish();
            return false;
        }

        return true;
    }

    save(pattern: Pattern, output: RelationReceiver) {
        const plan = makeQueryPlan(this, pattern, output);
        if (!this.checkValidation(plan))
            return;

        if (plan.modifiesExisting) {
            this.update(plan);
        } else {
            this.insert(plan);
        }
    }

    insert(plan: QueryPlan) {
        const { pattern, output } = plan;

        if (plan.views.length > 0) {
            const view: QueryTag = plan.views[0];

            if (view.column.storageProvider) {
                view.column.storageProvider.runSave(pattern, output);
                return;
            }

            emitCommandError(output, "view doesn't have a storageProvider");
            output.finish();
            return;
        }

        if (plan.objects.length > 0) {
            this.insertOnObject(plan);
            return;
        }

        this.valueDatabase.insert(plan);
    }

    update(plan: QueryPlan) {
        const { pattern, output } = plan;
        if (plan.views.length > 0) {
            const view: QueryTag = plan.views[0];

            if (view.column.storageProvider) {
                view.column.storageProvider.runSave(pattern, output);
                return;
            }

            emitCommandError(output, "view doesn't have a storageProvider");
            output.finish();
            return;
        }

        if (plan.objects.length > 0) {
            emitCommandError(output, "todo - updates on objects");
            return;
        }

        this.valueDatabase.update(plan);
    }

    search(pattern: Pattern, output: RelationReceiver) {
        const plan = makeQueryPlan(this, pattern, output);
        if (!this.checkValidation(plan))
            return;

        this.select(plan);
    }

    select(plan: QueryPlan) {
        const { pattern, output } = plan;

        if (plan.views.length > 0) {

            const view: QueryTag = plan.views[0];

            if (view.column.storageProvider) {
                view.column.storageProvider.runSearch(pattern, output);
                return;
            }

            emitCommandError(output, "view doesn't have a storageProvider");
            output.finish();
            return;
        }

        if (plan.objects.length > 0) {
            this.selectOnObject(plan);
            return;
        }

        this.valueDatabase.select(plan);
    }

    insertOnObject(plan: QueryPlan) {

        const { output } = plan;

        for (const value of plan.values) {
            plan.attributeSet.set(value.tag.tagType, value.tag.tagValue);
        }

        output.relation(plan.pattern);
        output.finish();
    }

    selectOnObject(plan: QueryPlan) {

        const { pattern, output } = plan;

        const attributeSet = plan.attributeSet;

        if (!attributeSet) {
            output.finish();
            return;
        }

        let outRel = pattern;
        for (const value of plan.values) {
            const tag = value.tag.tagType;
            outRel = outRel.setValueForType(tag, attributeSet.get(tag));
        }

        output.relation(outRel);

        output.finish();
    }
}

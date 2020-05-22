
import Graph from './Graph'
import Schema, { Column, ColumnType, ObjectColumn, ValueColumn, ViewColumn } from './Schema'
import Relation from './Relation'
import PatternTag from './PatternTag'
import { emitCommandError, emitCommandOutputFlags } from './CommandMeta'
import RelationReceiver from './RelationReceiver'
import Pattern from './Pattern'
import ValueDatabase from './ValueDatabase'
import QueryPlan, { QueryTag } from './QueryPlan'

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

    patternToQueryPlan(pattern: Pattern, output: RelationReceiver) {
        const { schema } = this;

        const planTags: QueryTag[] = [];

        let singleStar = false;
        let doubleStar = false;
        
        for (const tag of pattern.tags) {
            if (!tag.tagType) {
                if (tag.doubleStar) {
                    doubleStar = true;
                } else if (tag.star) {
                    singleStar = true;
                } else {
                    throw new Error('what is this: ' + tag.stringify())
                }

                continue;
            }

            const column = schema.initColumn(tag.tagType);
            
            planTags.push({
                tag,
                column,
                type: column.type
            });
        }

        const plan: QueryPlan = {
            tags: planTags,
            views: [],
            objects: [],
            values: [],
            pattern,
            singleStar,
            doubleStar,
            output
        };

        for (const tag of planTags) {
            if (tag.type === ViewColumn)
                plan.views.push(tag);
            else if (tag.type === ObjectColumn)
                plan.objects.push(tag);
            else if (tag.type === ValueColumn)
                plan.values.push(tag);
        }

        if (plan.views.length > 0)
            return plan;

        if (plan.objects.length > 0) {
            if (plan.objects.length == 1) {

                const tag = plan.objects[0].tag;
                const columnName = tag.tagType;

                this.objectStore[columnName] = this.objectStore[columnName] || {};

                if (tag.tagValue) {
                    this.objectStore[columnName][tag.tagValue] = this.objectStore[columnName][tag.tagValue] || new AttributeSet();
                    plan.attributeSet = this.objectStore[columnName][tag.tagValue];
                }

            } else {
                plan.objects.sort((a,b) => a.tag.tagType.localeCompare(b.tag.tagType));

                const multiObjectKey = plan.objects.map(t => t.tag.stringify()).join(' ');

                if (!this.multiObjectStore[multiObjectKey])
                    this.multiObjectStore[multiObjectKey] = new AttributeSet();

                plan.attributeSet = this.multiObjectStore[multiObjectKey];
            }

            return plan;
        }

        if (plan.values.length > 0) {
            plan.values.sort((a,b) => a.tag.tagType.localeCompare(b.tag.tagType));
        }

        return plan;
    }

    insert(op: InsertOperation) {

        const { relation, output } = op;

        const plan = this.patternToQueryPlan(relation, output);

        if (!this.checkValidation(plan))
            return;

        if (plan.views.length > 0) {
            const view: QueryTag = plan.views[0];

            if (view.column.storageProvider) {
                view.column.storageProvider.runSearch(relation, output);
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

    update(op: UpdateOperation) {
        const { pattern, output } = op;

        const plan = this.patternToQueryPlan(pattern, output);

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
            emitCommandError(output, "todo - updates on objects");
            return;
        }

        this.valueDatabase.update(plan);
    }

    select(op: SelectOperation) {
        const { pattern, output } = op;

        const plan = this.patternToQueryPlan(pattern, output);
        if (!this.checkValidation(plan))
            return;

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

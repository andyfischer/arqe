
import Graph from './Graph'
import Schema, { Column, ColumnType, ObjectColumn, ValueColumn, ViewColumn } from './Schema'
import Relation from './Relation'
import PatternTag from './PatternTag'
import { emitCommandError, emitCommandOutputFlags } from './CommandMeta'
import RelationReceiver from './RelationReceiver'
import Pattern from './Pattern'
import TupleStore from './TupleStore'
import QueryPlan, { QueryTag } from './QueryPlan'
import makeQueryPlan from './makeQueryPlan'
import logError from './logError'

export class AttributeSet {
    data: { [key: string]: string } = {}

    set(key: string, value: string) {
        this.data[key] = value;
    }

    get(key: string) {
        return this.data[key];
    }
}

export default class Database {

    graph: Graph
    schema: Schema

    tupleStore: TupleStore

    constructor(graph: Graph) {
        this.graph = graph;
        this.schema = new Schema();
        this.tupleStore = new TupleStore(this);
    }

    save(pattern: Pattern, output: RelationReceiver) {
        const plan = makeQueryPlan(this, pattern, output);
        if (!plan.passedValidation)
            return;

        if (plan.isDelete) {
            this.tupleStore.doDelete(plan);
        } else if (plan.modifiesExisting) {
            this.update(plan);
        } else {
            this.insert(plan);
        }
    }

    search(pattern: Pattern, output: RelationReceiver) {
        const plan = makeQueryPlan(this, pattern, output);
        if (!plan.passedValidation)
            return;

        this.select(plan);
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

        this.tupleStore.insert(plan);
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

        this.tupleStore.update(plan);
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

        this.tupleStore.select(plan);
    }
}

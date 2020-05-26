
import Graph from './Graph'
import Schema, { Column, ColumnType, ObjectColumn, ValueColumn, ViewColumn } from './Schema'
import Relation from './Relation'
import PatternTag from './PatternTag'
import { emitCommandError, emitCommandOutputFlags } from './CommandMeta'
import RelationReceiver from './RelationReceiver'
import Pattern from './Pattern'
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

    constructor(graph: Graph) {
        this.graph = graph;
        this.schema = new Schema();
    }

    save(pattern: Pattern, output: RelationReceiver) {
        const plan = makeQueryPlan(this.graph, pattern, output);
        if (!plan.passedValidation)
            return;

        if (plan.isDelete) {
            this.graph.tupleStore.doDelete(plan);
        } else if (plan.modifiesExisting) {
            this.update(plan);
        } else {
            this.insert(plan);
        }
    }

    search(pattern: Pattern, output: RelationReceiver) {
        const plan = makeQueryPlan(this.graph, pattern, output);
        if (!plan.passedValidation)
            return;

        this.select(plan);
    }

    insert(plan: QueryPlan) {
        const { pattern, output } = plan;

        this.graph.tupleStore.insert(plan);
    }

    update(plan: QueryPlan) {
        const { pattern, output } = plan;
        this.graph.tupleStore.update(plan);
    }

    select(plan: QueryPlan) {
        const { pattern, output } = plan;

        this.graph.tupleStore.select(plan);
    }
}

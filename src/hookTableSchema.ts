
import Graph from './Graph'
import Relation from './Relation'
import RelationReceiver from './RelationReceiver'

export function hookTableSchemaGet(graph: Graph, rel: Relation, output: RelationReceiver) {
    if (rel.hasType('table')) {

        // TODO- Modify queries that have table() to expand fields.

        // TODO- Check for table-schema and update the in-memory schema.
    }
}

export function hookTableSchemaSave(graph: Graph, rel: Relation, output: RelationReceiver) {
}

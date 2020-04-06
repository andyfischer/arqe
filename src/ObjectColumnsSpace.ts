
import Graph from './Graph'
import ObjectSpace from './ObjectSpace'
import GraphListener from './GraphListenerV3'
import Relation from './Relation'

export default class ObjectColumnsSpace implements GraphListener {
    graph: Graph
    columns: { [name: string]: ObjectSpace } = {}

    constructor(graph: Graph) {
        this.graph = graph;
    }

    maybeInitEntityColumn(name: string) {
        if (!this.columns[name]) {
            console.log('created object column: ', name);
            this.columns[name] = new ObjectSpace(name)
        }
    }

    onRelationCreated(rel: Relation) {
        console.log('ocs saw create: ', rel.stringify());

        const column = rel.getTagValue('column') as string;
        const columnType = rel.getTagValue('column-type') as string;

        if (columnType === 'entity') {
            this.maybeInitEntityColumn(column);
        } else if (columnType === 'attribute') {
            const withColumn = rel.getTagValue('with-column');
            this.columns[column].addAttribute(column);
        }
    }

    onRelationUpdated(rel: Relation) {
        console.log('ocs saw update: ', rel.stringify());
    }

    onRelationDeleted(rel: Relation) {
        console.log('warning: ObjectColumnsSpace does not support relation deletion');
    }
}

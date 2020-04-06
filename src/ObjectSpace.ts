
import IDSource from './IDSource'
import Graph from './Graph'
import GraphListener from './GraphListenerV3'
import Relation from './Relation'

interface Entity {
    attrs: { [name: string]: string }
}

export default class ObjectSpace {
    name: string
    idSource: IDSource

    objects: { [id: string]: Entity } = {}
    attributes: { [name: string]: boolean } = {}

    constructor(name: string) {
        this.name = name;
        this.idSource = new IDSource(name + '-');
    }

    addAttribute(name: string) {
        this.attributes[name] = true;
    }
}

export class ObjectTypeSpace implements GraphListener {
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
        const columnName = rel.getTagValue('object-type') as string;

        this.maybeInitEntityColumn(columnName);

        if (rel.hasType('attribute')) {
            const attr = rel.getTagValue('attribute');
            this.columns[columnName].addAttribute(attr);
        }
    }

    onRelationUpdated(rel: Relation) {
        console.log('ocs saw update: ', rel.stringify());
    }

    onRelationDeleted(rel: Relation) {
        console.log('warning: ObjectColumnsSpace does not support relation deletion');
    }
}

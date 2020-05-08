
import IDSource from '../utils/IDSource'
import Graph from '../Graph'
import GraphListener from '../GraphListenerV3'
import Relation from '../Relation'
import PatternTag from '../PatternTag'

interface Entity {
    id: string
    attrs: { [name: string]: string }
}

export default class ObjectSpace {
    name: string
    idSource: IDSource

    objects: Map<string, Entity> = new Map();
    attributes: Map<string, boolean> = new Map();

    constructor(name: string) {
        this.name = name;
        this.idSource = new IDSource(name + '-');
    }

    nextId() {
        return this.idSource.take();
    }

    defineAttribute(name: string) {
        this.attributes.set(name, true);
    }

    hasObject(id: string) {
        return this.objects.has(id);
    }

    object(id: string) {
        return this.objects.get(id);
    }

    createObject(id: string) {
        this.objects.set(id, this.objects.get(id) || {
            id,
            attrs: {}
        });

        return this.objects.get(id);
    }

    getExistingObject(id: string) {
        return this.objects.get(id);
    }
}

export class ObjectTypeSpace implements GraphListener {
    graph: Graph
    columns: Map<string, ObjectSpace> = new Map();

    constructor(graph: Graph) {
        this.graph = graph;
    }

    hasColumn(name: string) {
        return this.columns.has(name);
    }

    column(name: string) {
        return this.columns.get(name);
    }

    maybeInitEntityColumn(name: string) {
        if (!this.columns.has(name)) {
            this.columns.set(name, new ObjectSpace(name))
        }
    }

    onRelationCreated(rel: Relation) {
        const columnName = rel.getTagValue('object-type') as string;

        this.maybeInitEntityColumn(columnName);

        if (rel.hasType('attribute')) {
            const attr = rel.getTagValue('attribute');
            this.columns.get(columnName).defineAttribute(attr);
        }
    }

    onRelationUpdated(rel: Relation) {
        // console.log('onRelationUpdated', rel.stringify());
    }

    onRelationDeleted(rel: Relation) {
        console.log('warning: ObjectColumnsSpace does not support relation deletion');
    }
}

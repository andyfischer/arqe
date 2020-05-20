
import Relation from './Relation'
import Pattern from './Pattern'
import SchemaProviderAPI from './generated/SchemaProviderAPI'
import Graph from './Graph'

type ColumnType = 'value' | 'object' | 'table'

class Column {
    name: string
    type: ColumnType = 'value'

    constructor(name: string) {
        this.name = name;
    }
}

export default class Schema {

    graph: Graph

    constructor(graph: Graph) {
        this.graph = graph;

        const schemaColumn = this.initColumnIfMissing('schema');
        schemaColumn.type = 'table'
    }

    columns: { [name: string]: Column } = {}

    initColumnIfMissing(name: string) {
        if (!this.columns[name]) {
            this.columns[name] = new Column(name);
        }

        return this.columns[name];
    }

    beforeSave(relation: Relation) {
        // Autocreate columns if necessary
        for (const tag of relation.tags) {
            if (tag.tagType)
                this.initColumnIfMissing(tag.tagType);
        }

        // Classify tags
        const classified = [];
        for (const tag of relation.tags) {
            if (tag.doubleStar) {
                classified.push('**')
            } else {
                classified.push(this.columns[tag.tagType].type);
            }
        }

        classified.sort();

        //if (classified[0] === 'value')
        //    console.log('no object type: ' + relation.stringify())

        // console.log('saving: ' + classified.join(' '))
    }

    getProvider() {
        return new SchemaProviderAPI({
            setObjectColumn: (columnName: string) => {
                const column = this.initColumnIfMissing(columnName);
                column.type = 'object'
            },
            setTableColumn: (columnName: string) => {
                const column = this.initColumnIfMissing(columnName);
                column.type = 'table'
            }
        })
    }
}

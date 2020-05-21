
import Relation from './Relation'
import Pattern from './Pattern'
import SchemaProviderAPI from './generated/SchemaProviderAPI'
import Graph from './Graph'

class ColumnType {
    name: string

    constructor(name: string) {
        this.name = name;
    }
}

const ObjectColumn = new ColumnType('object');
const ValueColumn = new ColumnType('value');
const ViewColumn = new ColumnType('view');

class Column {
    name: string
    type: ColumnType = ValueColumn

    constructor(name: string) {
        this.name = name;
    }
}

export default class Schema {

    constructor() {
        const schemaColumn = this.initColumnIfMissing('schema');
        schemaColumn.type = ViewColumn;
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
    }

    checkTagsClassification(relation: Relation) {

        const classified = [];
        for (const tag of relation.tags) {
            if (tag.doubleStar) {
                classified.push('**')
            } else {
                classified.push(this.columns[tag.tagType].type);
            }
        }

        classified.sort();

        if (classified[0] === ValueColumn)
            console.log('no object type: ' + relation.stringify())
    }

    getProvider() {
        return new SchemaProviderAPI({
            setObjectColumn: (columnName: string) => {
                const column = this.initColumnIfMissing(columnName);
                column.type = ObjectColumn;
            },
            setViewColumn: (columnName: string) => {
                const column = this.initColumnIfMissing(columnName);
                column.type = ViewColumn;
            }
        })
    }
}

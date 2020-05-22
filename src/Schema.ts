
import Relation from './Relation'
import Pattern from './Pattern'
import SchemaProviderAPI from './generated/SchemaProviderAPI'
import Graph from './Graph'
import StorageProviderV3 from './StorageProviderV3'


export class ColumnType {
    name: string
    sortPriority: number

    constructor(name: string, sortPriority: number) {
        this.name = name;
        this.sortPriority = sortPriority;
    }
}

export const ViewColumn = new ColumnType('view', 0);
export const ObjectColumn = new ColumnType('object', 1);
export const ValueColumn = new ColumnType('value', 2);

export class Column {
    name: string
    type: ColumnType = ValueColumn

    storageProvider?: StorageProviderV3

    constructor(name: string) {
        this.name = name;
    }
}

export default class Schema {

    constructor() {
        const schemaColumn = this.initColumn('schema');
        schemaColumn.type = ViewColumn;
        schemaColumn.storageProvider = this.getProvider();
    }

    columns: { [name: string]: Column } = {}

    initColumn(name: string) {
        if (!name)
            throw new Error('missing name');

        if (!this.columns[name]) {
            this.columns[name] = new Column(name);
        }

        return this.columns[name];
    }

    beforeSave(relation: Relation) {
        // Autocreate columns if necessary
        for (const tag of relation.tags) {
            if (tag.tagType)
                this.initColumn(tag.tagType);
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
                const column = this.initColumn(columnName);
                column.type = ObjectColumn;
            },
            setViewColumn: (columnName: string) => {
                const column = this.initColumn(columnName);
                column.type = ViewColumn;
            }
        })
    }
}

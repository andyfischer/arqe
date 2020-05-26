
export default class ColumnType {
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

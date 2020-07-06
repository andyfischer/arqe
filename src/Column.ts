
import ColumnType, { ValueColumn } from './ColumnType'

export default class Column {
    name: string
    type: ColumnType = ValueColumn

    constructor(name: string) {
        this.name = name;
    }
}

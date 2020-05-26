
import ColumnType, { ValueColumn } from './ColumnType'
import StorageProvider from './StorageProvider'

export default class Column {
    name: string
    type: ColumnType = ValueColumn

    storageProvider?: StorageProvider

    constructor(name: string) {
        this.name = name;
    }
}

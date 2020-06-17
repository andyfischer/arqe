
import Tuple from './Tuple'
import Pattern from './Pattern'
import PatternTag from './PatternTag'
import Stream from './Stream'
import Schema, { Column, ColumnType } from './Schema'
import StorageProvider from './StorageProvider'
import Table from './Table'
import TableInterface from './TableInterface'

export interface QueryTag {
    type: ColumnType
    column: Column
    tag: PatternTag
}

export default interface QueryPlan {
    tags: QueryTag[]

    singleStar: boolean
    doubleStar: boolean
    modifiesExisting: boolean
    initializeIfMissing: boolean
    isDelete?: boolean
    modificationCallback?: (tuple: Tuple) => Pattern

    tuple: Tuple
    filterPattern: Pattern
    output: Stream
    storageProvider?: StorageProvider

    table?: TableInterface
    tableName?: string
    searchTables?: TableInterface[]

    failed: boolean
}

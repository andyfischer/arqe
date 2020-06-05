
import Pattern from './Pattern'
import PatternTag from './PatternTag'
import TupleReceiver from './TupleReceiver'
import Schema, { Column, ColumnType } from './Schema'
import StorageProvider from './StorageProvider'

export interface QueryTag {
    type: ColumnType
    column: Column
    tag: PatternTag
}

export default interface QueryPlan {
    tags: QueryTag[]
    views: QueryTag[]
    objects: QueryTag[]
    values: QueryTag[]

    singleStar: boolean
    doubleStar: boolean
    modifiesExisting: boolean
    initializeIfMissing: boolean
    isDelete?: boolean
    modificationCallback?: (pattern: Pattern) => Pattern

    pattern: Pattern
    filterPattern: Pattern
    output: TupleReceiver
    storageProvider?: StorageProvider
    tableName?: string

    passedValidation?: boolean
}

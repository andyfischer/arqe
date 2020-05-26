
import Pattern from './Pattern'
import PatternTag from './PatternTag'
import RelationReceiver from './RelationReceiver'
import { AttributeSet } from './Database'
import Schema, { Column, ColumnType } from './Schema'
import StorageProviderV3 from './StorageProviderV3'

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
    output: RelationReceiver
    storageProvider?: StorageProviderV3

    attributeSet?: AttributeSet

    passedValidation?: boolean
}

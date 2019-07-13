
import { Query } from '../query'
import { Snapshot } from '../framework'
import { ReducerDefinition } from '.'

export default interface LiveReducer<ValueT = any> {
    name: string
    value: ValueT
    reducer: (query: Query, currentValue: ValueT) => ValueT
    spamsChangeLog?: boolean
}

export type ReducerDefinition<T> = () => LiveReducer<T>

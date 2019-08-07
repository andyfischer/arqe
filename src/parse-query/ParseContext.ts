
import { Query } from '.'
import { readTextLinesSync, toSet } from '../utils'

export default interface ParseContext {
    isRelation: (text: string) => boolean
    isCommand: (text: string) => boolean
    getLastIncompleteClause: () => Query
}

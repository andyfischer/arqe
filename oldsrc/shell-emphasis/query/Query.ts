
import { Snapshot } from '../framework'
import QuerySyntax from '../parse-query/QuerySyntax'
import QueryResult from './QueryResult'

type QueryType = 'command' | 'relation' | 'unknown' | 'empty'

export default interface Query {
    syntax: QuerySyntax

    type: QueryType
    options: { [key: string]: string }
    args?: string[]

    isIncomplete?: boolean

    // Command
    command?: string

    // Relation
    relationSubject?: string
    relation?: string

    // Context / Execution
    snapshot?: Snapshot
    isInteractive?: boolean
    get?: (name: string) => any
    getOptional?: (name: string, defaultValue: any) => any
    subQuery?: (str: string) => Promise<QueryResult>

    // Response
    respond?: (data: any) => void
    promise?: Promise<any>
}

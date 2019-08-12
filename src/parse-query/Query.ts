
import { Snapshot } from '../framework'
import QuerySyntax from './QuerySyntax'

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

    // Context
    snapshot?: Snapshot
    get?: (name: string) => any
    isInteractive?: boolean

    // Response
    respond?: (data: any) => void
    promise?: Promise<any>
}


import { Snapshot } from '../framework'
import QuerySyntax from './QuerySyntax'

type QueryType = 'command' | 'relation' | 'unknown' | 'empty'

export default interface Query {
    syntax: QuerySyntax

    type: QueryType
    options: { [key: string]: string }

    isIncomplete?: boolean

    command?: string
    commandArgs?: string[]

    relationSubject?: string
    relation?: string
    relationArgs?: string[]

    // Context
    snapshot?: Snapshot
    get?: (name: string) => any
    isInteractive?: boolean

    // Response
    respond?: (data: any) => void
    promise?: Promise<any>
}

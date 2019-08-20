
import SourcePos from '../types/SourcePos'

interface Arg {
    key?: string
    assignVal?: string
    isDots?: boolean
}

export default interface QuerySyntax {
    originalStr: string
    clauses: Arg[]
    indent: number
    incomplete?: boolean
    sourcePos?: SourcePos
}

export interface PipedQueriesSyntax {
    originalStr: string
    queries: QuerySyntax[]
}

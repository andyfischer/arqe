
interface Arg {
    key?: string
    assignVal?: string
    isDots?: boolean
}

interface SourcePos { 
    filename?: string
    lineStart: number
    lineEnd: number
    columnStart: number
    columnEnd: number
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

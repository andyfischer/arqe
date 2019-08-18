
interface Arg {
    key?: string
    assignVal?: string
    isDots?: boolean
}

export default interface QuerySyntax {
    originalStr: string
    clauses: Arg[]
    indent: number
}

export interface PipedQueriesSyntax {
    originalStr: string
    queries: QuerySyntax[]
}

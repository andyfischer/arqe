
interface Clause {
    key?: string
    assignVal?: string
    isDots?: boolean
}

export default interface QuerySyntax {
    originalStr: string
    clauses: Clause[]
    indent: number
    incomplete?: boolean
}

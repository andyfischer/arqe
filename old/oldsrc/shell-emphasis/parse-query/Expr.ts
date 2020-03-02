
import SourcePos from '../types/SourcePos'
import ParsedQuery from './ParsedQuery'
import QueryExpr from './QueryExpr'

export default interface Expr {
    id: number
    type: 'piped' | 'query'
    sourcePos?: SourcePos
    isStatement?: boolean
    statementIndent?: number
    parent: ParsedQuery
    originalStr?: string

    getPipedQueries: () => QueryExpr[]
}

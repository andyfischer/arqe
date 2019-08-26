
import Expr from './Expr'
import ParsedQuery from './ParsedQuery'
import QueryExpr from './QueryExpr'
import SourcePos from '../types/SourcePos'

export default class PipedExpr implements Expr {
    id: number
    type: 'piped'
    itemIds: number[]
    statementIndent?: number
    sourcePos?: SourcePos
    parent: ParsedQuery

    constructor(values) {
        Object.assign(this, values);
    }

    getPipedQueries(): QueryExpr[] {
        return this.itemIds.map(id => this.parent.exprs[id]) as QueryExpr[];
    }
}

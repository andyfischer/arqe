
import Expr from './Expr'
import SourcePos from '../types/SourcePos'
import ParsedQuery from './ParsedQuery'

interface ArgExpr {
    keyword?: string
    lhsName?: string
    rhsValue?: string
}

export default class QueryExpr implements Expr {
    id: number
    type: 'query'
    args: ArgExpr[]
    sourcePos?: SourcePos
    statementIndent?: number
    parent: ParsedQuery

    constructor(values) {
        Object.assign(this, values);
    }

    getNameValuePairs(): { [key:string]: any} {
        const out = {}
        for (const arg of this.args) {
            if (arg.lhsName) {
                out[arg.lhsName] = arg.rhsValue;
            }
        }
        return out;
    }

    getPipedQueries(): QueryExpr[] {
        return [this];
    }
}


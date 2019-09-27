
import { parseSingleLine } from '../parse-query'
import { QueryExpr } from '../parse-query/parseQueryV3'
import { CommandDefinition } from '../types/CommandDatabase'
import CommandImplementation from '../types/CommandImplementation'

export default class VM {

    scope: any = {}
    
    lookupCommand?: (s: string) => CommandImplementation

    _lookupCommand(s: string) {
    }

    async executeQuery(expr: QueryExpr) {
        // Resolve args

    }

    async executeQueryString(query: string, options: {}) {
    }
}

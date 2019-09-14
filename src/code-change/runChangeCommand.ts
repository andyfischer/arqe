
import handleCommand from './handleCommand'
import { parseString, Expr, PipedExpr, QueryExpr } from '../parse-query'
import CodeFile from './CodeFile'
import Cursor, { TokenRange } from './Cursor'

export default function resolveSelector(file: CodeFile, selector: string) {
    // Maintain an in-progress cursor.
    const cursor = new Cursor(file)

    // Parse selector as a single statement
    const syntax = parseString(selector, 'statement');
    const statement = syntax.getStatement();

    // Loop through each barred section.
    for (const expr of statement.getPipedQueries()) {
        handleCommand(expr, cursor);
    }

    return cursor;
}

// examples:
//       find-string implementAll | enter-block | after-contents
//       insert after-imports
//       replace call func=implement argument 0


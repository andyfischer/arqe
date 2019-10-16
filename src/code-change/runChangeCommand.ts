
import handleCommand from './handleCommand'
import { Expr, PipedExpr, QueryExpr } from '../parse-query'
import CodeFile from './CodeFile'
import Cursor, { TokenRange } from './Cursor'
// import { parseSingleLine } from '../parse-query'

export default function resolveSelector(file: CodeFile, selector: string) {
    // Maintain an in-progress cursor.
    const cursor = new Cursor(file)

    // Parse selector as a single statement
    // const { exprs } = await parseSingleLine({ text: selector });

    // Loop through each barred section.
    /*
    for (const expr of statement.getPipedQueries()) {
        handleCommand(expr, cursor);
    }
    */

    return cursor;
}

// examples:
//       find-string implementAll | enter-block | after-contents
//       insert after-imports
//       replace call func=implement argument 0


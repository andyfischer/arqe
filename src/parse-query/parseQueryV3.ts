
// V3 notes:
// Just emit finished queries instead of creating an AST.
// Need to port over 'parseQueryStructure' to this expression type.
// Receiver doesn't care about "piped expr", but they do care about
// receivers & senders of data.
// Might need to create an AST as a dependency tree..
// Maybe each Query needs a unique ID.

import SourcePos from '../types/SourcePos'
import { tokenizeString, TokenIterator, Token,
    t_equals, t_space, t_hash, t_double_dot, t_newline, t_bar } from '../lexer'

interface Arg {
}

interface Expr {
    id: number
    type: 'pipe' | 'query'
    sourcePos?: SourcePos
    args: Arg[]
    originalStr?: string
}

interface ProgressEvent {
}

interface ParseRequest {
    text: string
    onExpr: (expr: Expr) => Promise<any>
    onProgress: (event: ProgressEvent) => Promise<any>
}

class Context {
    originalStr: string
    req: ParseRequest
    it: TokenIterator
    nextId: number = 1

    takeNextId() {
        const id = this.nextId;
        this.nextId += 1;
        return id;
    }
}

function consumeKey(it: TokenIterator) {
    let text = '';

    while (!it.finished()
            && !it.nextIs(t_space)
            && !it.nextIs(t_newline)
            && !it.nextIs(t_bar)
            && !it.nextIs(t_equals)) {

        text += it.nextUnquotedText();
        it.consume();
    }

    return text;
}

function consumeOptionValue(it: TokenIterator) {
    let text = '';

    while (!it.finished()
            && !it.nextIs(t_space)
            && !it.nextIs(t_bar)
            && !it.nextIs(t_newline)
          ) {
        text += it.nextUnquotedText();
        it.consume();
    }

    return text;
}


function parseSingleLine(req: ParseRequest) {
    const { iterator } = tokenizeString(req.text);

    const cxt = new Context();
    cxt.it = iterator;
    cxt.req = req;
}

function parseMultiLine(req: ParseRequest) {
}

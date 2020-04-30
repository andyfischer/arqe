
export class Block {
    blockType: string
    statements: Statement[] = []
    parent: Statement

    constructor(blockType: string, parent: Statement) {
        this.blockType = blockType;
        this.parent = parent;
    }

    stringify() {
        return stringifyBlock(this);
    }

    addImport(lhs: string, rhs: string) {
        this.statements.push(new ImportStatement(lhs, rhs));
    }

    addClass(className: string) {
        const def = new ClassDef(className);
        this.statements.push(def);
        return def;
    }

    addRaw(text: string) {
        this.statements.push(new RawStatement(text));
    }

    addBlank() {
        this.statements.push(new BlankLine());
    }

    addMethod(name: string) {
        const decl = new FunctionDecl('method', name);
        this.statements.push(decl);
        return decl;
    }

    addIf() {
        const ifBlock = new IfBlock();
        this.statements.push(ifBlock);
        return ifBlock;
    }
}

class ImportStatement implements Statement {
    lhs: string
    rhs: string

    constructor(lhs, rhs) {
        this.lhs = lhs;
        this.rhs = rhs;
    }

    line() {
        return `import ${this.lhs} from "${this.rhs}"`
    }
}

class RawStatement {
    text: string

    constructor(text: string) {
        this.text = text;
    }

    line() {
        return this.text;
    }
}

class BlankLine implements Statement {

    line() {
        return ''
    }
}

class FunctionInputDef {
    name: string
    tsType?: string
}

interface Statement {
    line: () => string
    contents?: Block
}

class Whitespace implements Statement {
    line() {
        return ''
    }
}

class StringStatement implements Statement {
    line() {
        return ''
    }
}

class ClassDef implements Statement {
    name: string
    contents: Block
    isExport = false
    isExportDefault = false

    constructor(name: string) {
        this.name = name;
        this.contents = new Block('class', this)
    }

    addField(name: string, tsType: string) {
        this.contents.statements.push(new FieldDecl(name, tsType));
    }

    line() {
        let s = `class ${this.name}`
        if (this.isExportDefault)
            s = 'export default ' + s;
        else if (this.isExport)
            s = 'export ' + s;

        return s;
    }
}

class FieldDecl implements Statement {
    name: string
    tsType?: string
    initializerExr: string

    constructor(name: string, tsType: string) {
        this.name = name;
        this.tsType = tsType;
    }

    line() {
        let s = `${this.name}: ${this.tsType}`
        if (this.initializerExr)
            s += ` = ${this.initializerExr}`;
        return s;
    }
}

class FunctionDecl implements Statement {
    statementType = 'functionDecl'
    format: string
    name: string
    inputs: { name: string, tsType: string }[] = []
    outputType: string
    contents: Block
    isAsync = false

    constructor(format: string, name: string) {
        this.format = format;
        this.name = name;
        this.contents = new Block('function', this)
    }
    
    addInput(name: string, tsType: string) {
        this.inputs.push({name, tsType});
    }

    setOutputType(tsType: string) {
        this.outputType = tsType;
    }

    line() {
        const inputs = this.inputs.map(input => {
            let s = input.name;
            if (input.tsType)
                s += ': ' + input.tsType;
            return s;
        }).join(', ');

        let str = '';

        if (this.isAsync)
            str += 'async '

        if (this.format === 'method')
            str += `${this.name}(${inputs})`
        else
            str += `function ${this.name}(${inputs})`

        if (this.outputType)
            str += ': ' + this.outputType;

        return str;
    }
}

class IfBlock implements Statement {
    conditionExpr: string
    contents: Block

    constructor() {
        this.contents = new Block('if', this)
    }

    setCondition(s: string) {
        this.conditionExpr = s;
    }

    line() {
        return `if (${this.conditionExpr})`;
    }
}

export function startFile() {
    return new Block('file', null);
}

class LineWriter {
    currentIndent: number = 0
    indentStr: string
    out: string[] = []

    writeln(s: string) {
        if (this.out.length > 0)
            this.out.push('\n');

        if (s) {
            this.out.push(this.indentStr);
            this.out.push(s);
        }
    }

    indent() {
        this.currentIndent += 1;
        this.indentStr = '    '.repeat(this.currentIndent);
    }

    unindent() {
        if (this.currentIndent == 0)
            throw new Error(`can't unindent at 0`);

        this.currentIndent -= 1;
        this.indentStr = '    '.repeat(this.currentIndent);
    }

    stringify() {
        return this.out.join('');
    }
}

function* iterateBlock(block: Block) {
    for (const statement of block.statements) {
        yield ({ statement })

        if (statement.contents) {
            yield ({ startBlock: statement.contents })
            yield* iterateBlock(statement.contents);
            yield ({ finishBlock: statement.contents })
        }
    }
}

export function stringifyBlock(block: Block) {
    const out = [];
    const writer = new LineWriter();

    for (const it of iterateBlock(block)) {

        if (it.startBlock) {
            writer.indent()
        }

        if (it.statement) {
            if (it.statement.statementType === 'functionDecl') {
                writer.writeln('')
            }

            let line = it.statement.line();

            if (it.statement.contents) {
                line += ' {';
            }

            writer.writeln(line);
        }

        if (it.finishBlock) {
            writer.unindent()
            writer.writeln('}');
        }
    }

    return writer.stringify();
}


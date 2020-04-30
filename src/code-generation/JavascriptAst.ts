
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
    statementType = 'import'
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
    statementType = 'raw'
    text: string

    constructor(text: string) {
        this.text = text;
    }

    line() {
        return this.text;
    }
}

class BlankLine implements Statement {

    statementType = 'blank'
    line() {
        return ''
    }
}

class FunctionInputDef {
    name: string
    tsType?: string
}

interface Statement {
    statementType: string
    line: () => string
    contents?: Block
}

class Whitespace implements Statement {
    statementType = 'whitespace'
    line() {
        return ''
    }
}

class ClassDef implements Statement {
    statementType = 'classDef'
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
    statementType = 'fieldDecl'
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
    statementType = 'ifBlock'
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

function shouldAddSpacerBetween(a: Statement, b: Statement) {
    if (a.statementType === 'blank' || b.statementType === 'blank')
        return false;

    if (a.contents || b.contents)
        return true;

    if (a.statementType === 'import' && b.statementType !== 'import')
        return true;

    return false;
}

function* iterateBlockDfs(block: Block) {
    for (const statement of block.statements) {
        yield ({ statement })

        if (statement.contents) {
            yield ({ startBlock: statement.contents })
            yield* iterateBlockDfs(statement.contents);
            yield ({ finishBlock: statement.contents })
        }
    }
}

export function formatBlock(block: Block) {

    for (let i = 0; i < block.statements.length; i += 1) {
        const statement = block.statements[i];
        const next = block.statements[i + 1];

        if (statement.contents)
            formatBlock(statement.contents);

        if (next && shouldAddSpacerBetween(statement, next)) {
            block.statements.splice(i + 1, 0, new BlankLine());
            i += 1;
        }
    }
}

export function stringifyBlock(block: Block) {
    const out = [];
    const writer = new LineWriter();

    for (const it of iterateBlockDfs(block)) {

        if (it.startBlock) {
            writer.indent()
        }

        if (it.statement) {
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


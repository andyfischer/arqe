
export class Block {
    blockType: string
    statements: Statement[] = []
    parent: Statement
    formatOneLine: boolean = false

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

    addInterface(name: string) {
        const def = new InterfaceDef(name);
        this.statements.push(def);
        return def;
    }

    addRaw(text: string) {
        this.statements.push(new RawStatement(text));
        return this;
    }

    addBlank() {
        this.statements.push(new BlankLine());
    }

    addMethod(name: string) {
        const decl = new FunctionDecl('method', name);
        this.statements.push(decl);
        return decl;
    }

    addIf(condition?: string) {
        const ifBlock = new IfBlock();
        if (condition)
            ifBlock.setCondition(condition);
        this.statements.push(ifBlock);
        return ifBlock;
    }

    _for(line: string) {
        const forBlock = new ForBlock();
        forBlock.forLine = line;
        this.statements.push(forBlock);
        return forBlock;
    }

    addObjectField(name: string, value: string) {
        const field = new ObjectField(name, value);
        this.statements.push(field);
        return field;
    }

    addComment(str) {
        this.addRaw('// ' + str);
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
    implementsList: string[] = []
    isExport = false
    isExportDefault = false

    constructor(name: string) {
        this.name = name;
        this.contents = new Block('class', this)
    }

    addField(name: string, tsType: string) {
        this.contents.statements.push(new FieldDecl(name, tsType));
    }

    addImplements(name: string) {
        this.implementsList.push(name);
    }

    line() {
        let s = `class ${this.name}`
        if (this.isExportDefault)
            s = 'export default ' + s;
        else if (this.isExport)
            s = 'export ' + s;

        if (this.implementsList.length > 0) {
            s += ` implements ${this.implementsList.join(', ')}`
        }

        return s;
    }
}

class InterfaceDef implements Statement {
    statementType = 'interfaceDef'
    name: string
    contents: Block
    isExport = false
    isExportDefault = false

    constructor(name: string) {
        this.name = name;
        this.contents = new Block('interface', this)
    }

    addField(name: string, tsType: string) {
        this.contents.statements.push(new FieldDecl(name, tsType));
    }

    line() {
        let s = `interface ${this.name}`
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

class ObjectField implements Statement {
    statementType = 'objectField'
    name: string
    valueExpr: string

    constructor(name: string, valueExpr: string) {
        this.name = name;
        this.valueExpr = valueExpr;
    }

    line() {
        return `${this.name}: ${this.valueExpr}`
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

class ForBlock implements Statement {
    statementType = 'forBlock'
    forLine: string
    contents: Block

    constructor() {
        this.contents = new Block('for', this)
    }

    line() {
        return `for (${this.forLine})`;
    }
}

class FunctionTypeDef {
    inputs: { name: string, tsType: string}[] = []
    outputType: string = 'void'

    constructor() {
    }

    addInput(name: string, tsType: string) {
        this.inputs.push({name, tsType});
    }

    setOutputType(t: string) {
        this.outputType = t;
    }

    line() {
        const inputStr = this.inputs.map(input => `${input.name}: ${input.tsType}`).join(', ');
        return `(${inputStr}) => ${this.outputType}`;
    }
}

class LineWriter {
    currentIndent: number = 0
    indentStr: string
    out: string[] = []
    startedNewLine = true;

    write(s?: string) {

        if (s) {
            if (this.startedNewLine)
                this.out.push(this.indentStr);
            this.out.push(s);
        }

        this.startedNewLine = false;
    }

    writeln(s?: string) {
        this.write(s);
        this.out.push('\n');
        this.startedNewLine = true;
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
        if (this.out[this.out.length - 1] === '\n')
            this.out.pop();
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

export function startFile() {
    return new Block('file', null);
}

export function startObjectLiteral() {
    return new Block('object-literal', null);
}

function* iterateBlock(block: Block) {
    yield ({ startBlock: block });

    for (const statement of block.statements) {
        yield ({ statement, currentBlock: block })

        if (statement.contents) {
            yield* iterateBlock(statement.contents);
        }
    }

    yield ({ finishBlock: block });
}

export function startFunctionTypeDef() {
    return new FunctionTypeDef();
}

export function formatBlock(block: Block) {

    if (block.blockType === 'object-literal' && block.statements.length === 1)
        block.formatOneLine = true;

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

export function startExpressionAst() {
}

export function stringifyBlock(block: Block) {
    const out = [];
    const writer = new LineWriter();

    for (const it of iterateBlock(block)) {

        if (it.startBlock) {
            switch (it.startBlock.blockType) {
            case 'file':
                continue;

            case 'class':
            case 'function':
            case 'if':
            case 'for':
            case 'interface':
                writer.writeln(' {')
                writer.indent();
                continue;

            default:
                if (it.startBlock.formatOneLine) {
                    writer.write('{ ')
                } else {
                    writer.writeln('{')
                    writer.indent();
                }
                continue;
            }
        }

        if (it.statement) {
            const text = it.statement.line();
            writer.write(text);

            if (it.currentBlock.formatOneLine)
                continue;

            if (it.currentBlock.blockType === 'object-literal') {
                writer.writeln(',')
                continue;
            }

            switch(it.statement.statementType) {
                case 'classDef':
                case 'interfaceDef':
                case 'functionDecl':
                case 'ifBlock':
                case 'forBlock':
                    continue;
            }

            writer.writeln();
        }

        if (it.finishBlock) {
            switch (it.finishBlock.blockType) {
            case 'file':
                continue;

            case 'class':
                writer.unindent();
                writer.writeln('}')
                continue;
            
            default:
                if (it.finishBlock.formatOneLine) {
                    writer.write(' }')
                } else {
                    writer.unindent();
                    writer.writeln('}')
                }
                continue;
            }
        }
    }

    return writer.stringify();
}


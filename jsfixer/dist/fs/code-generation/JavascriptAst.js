"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Block {
    constructor(blockType, parent) {
        this.statements = [];
        this.formatOneLine = false;
        this.blockType = blockType;
        this.parent = parent;
    }
    stringify() {
        return stringifyBlock(this);
    }
    addImport(lhs, rhs) {
        this.statements.push(new ImportStatement(lhs, rhs));
    }
    addClass(className) {
        const def = new ClassDef(className);
        this.statements.push(def);
        return def;
    }
    addRaw(text) {
        this.statements.push(new RawStatement(text));
    }
    addBlank() {
        this.statements.push(new BlankLine());
    }
    addMethod(name) {
        const decl = new FunctionDecl('method', name);
        this.statements.push(decl);
        return decl;
    }
    addIf() {
        const ifBlock = new IfBlock();
        this.statements.push(ifBlock);
        return ifBlock;
    }
    addObjectField(name, value) {
        const field = new ObjectField(name, value);
        this.statements.push(field);
        return field;
    }
}
exports.Block = Block;
class ImportStatement {
    constructor(lhs, rhs) {
        this.statementType = 'import';
        this.lhs = lhs;
        this.rhs = rhs;
    }
    line() {
        return `import ${this.lhs} from "${this.rhs}"`;
    }
}
class RawStatement {
    constructor(text) {
        this.statementType = 'raw';
        this.text = text;
    }
    line() {
        return this.text;
    }
}
class BlankLine {
    constructor() {
        this.statementType = 'blank';
    }
    line() {
        return '';
    }
}
class FunctionInputDef {
}
class Whitespace {
    constructor() {
        this.statementType = 'whitespace';
    }
    line() {
        return '';
    }
}
class ClassDef {
    constructor(name) {
        this.statementType = 'classDef';
        this.isExport = false;
        this.isExportDefault = false;
        this.name = name;
        this.contents = new Block('class', this);
    }
    addField(name, tsType) {
        this.contents.statements.push(new FieldDecl(name, tsType));
    }
    line() {
        let s = `class ${this.name}`;
        if (this.isExportDefault)
            s = 'export default ' + s;
        else if (this.isExport)
            s = 'export ' + s;
        return s;
    }
}
class FieldDecl {
    constructor(name, tsType) {
        this.statementType = 'fieldDecl';
        this.name = name;
        this.tsType = tsType;
    }
    line() {
        let s = `${this.name}: ${this.tsType}`;
        if (this.initializerExr)
            s += ` = ${this.initializerExr}`;
        return s;
    }
}
class ObjectField {
    constructor(name, valueExpr) {
        this.statementType = 'objectField';
        this.name = name;
        this.valueExpr = valueExpr;
    }
    line() {
        return `${this.name}: ${this.valueExpr}`;
    }
}
class FunctionDecl {
    constructor(format, name) {
        this.statementType = 'functionDecl';
        this.inputs = [];
        this.isAsync = false;
        this.format = format;
        this.name = name;
        this.contents = new Block('function', this);
    }
    addInput(name, tsType) {
        this.inputs.push({ name, tsType });
    }
    setOutputType(tsType) {
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
            str += 'async ';
        if (this.format === 'method')
            str += `${this.name}(${inputs})`;
        else
            str += `function ${this.name}(${inputs})`;
        if (this.outputType)
            str += ': ' + this.outputType;
        return str;
    }
}
class IfBlock {
    constructor() {
        this.statementType = 'ifBlock';
        this.contents = new Block('if', this);
    }
    setCondition(s) {
        this.conditionExpr = s;
    }
    line() {
        return `if (${this.conditionExpr})`;
    }
}
class LineWriter {
    constructor() {
        this.currentIndent = 0;
        this.out = [];
        this.startedNewLine = true;
    }
    write(s) {
        if (s) {
            if (this.startedNewLine)
                this.out.push(this.indentStr);
            this.out.push(s);
        }
        this.startedNewLine = false;
    }
    writeln(s) {
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
function shouldAddSpacerBetween(a, b) {
    if (a.statementType === 'blank' || b.statementType === 'blank')
        return false;
    if (a.contents || b.contents)
        return true;
    if (a.statementType === 'import' && b.statementType !== 'import')
        return true;
    return false;
}
function startFile() {
    return new Block('file', null);
}
exports.startFile = startFile;
function startObjectLiteral() {
    return new Block('object-literal', null);
}
exports.startObjectLiteral = startObjectLiteral;
function* iterateBlock(block) {
    yield ({ startBlock: block });
    for (const statement of block.statements) {
        yield ({ statement, currentBlock: block });
        if (statement.contents) {
            yield* iterateBlock(statement.contents);
        }
    }
    yield ({ finishBlock: block });
}
function formatBlock(block) {
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
exports.formatBlock = formatBlock;
function stringifyBlock(block) {
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
                    writer.writeln(' {');
                    writer.indent();
                    continue;
                default:
                    if (it.startBlock.formatOneLine) {
                        writer.write('{ ');
                    }
                    else {
                        writer.writeln('{');
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
                writer.writeln(',');
                continue;
            }
            switch (it.statement.statementType) {
                case 'classDef':
                case 'functionDecl':
                case 'ifBlock':
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
                    writer.writeln('}');
                    continue;
                default:
                    if (it.finishBlock.formatOneLine) {
                        writer.write(' }');
                    }
                    else {
                        writer.unindent();
                        writer.writeln('}');
                    }
                    continue;
            }
        }
    }
    return writer.stringify();
}
exports.stringifyBlock = stringifyBlock;
//# sourceMappingURL=JavascriptAst.js.map
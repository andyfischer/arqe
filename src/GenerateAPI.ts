
import Graph from './Graph'
import Fs from 'fs'

function javascriptTemplate(vars) {
    return (
`import Graph from './fs/Graph'
import Relation from './fs/Relation'

export class GraphAPI {
    graph: Graph

    constructor(graph: Graph) {
        this.graph = graph;
    }

    run(...inputs: any[]) {
    }

${vars.methodSource}
}
`);
}

class JavascriptCodeWriter {
    out: (s: string) => void

    needsNewline = false
    inputsNeedComma = false
    indentLevel: number

    increaseIndent() {
        this.indentLevel += 1;
    }

    decreaseIndent() {
        this.indentLevel -= 1;
    }

    startNewLine() {
        if (this.needsNewline)
            this.out('\n');

        for (let i = 0; i < this.indentLevel; i++)
            this.out('    ')

        this.needsNewline = true;
    }

    startFunction(funcName: string, writeInputs: (writer: JavascriptCodeWriter) => void) {
        this.startNewLine()
        this.out(funcName);

        this.out('(')
        writeInputs(this)
        this.out(') {')
        this.indentLevel += 1;
    }

    writeInput(name: string, typeName?: string) {
        if (this.inputsNeedComma)
            this.out(', ')

        this.out(name);

        if (typeName) {
            this.out(': ')
            this.out(typeName);
        }

        this.inputsNeedComma = true;
    }

    finishFunction() {
        this.indentLevel -= 1;
        this.startNewLine()
        this.out('}')
    }

    writeLine(line: string = '') {
        this.startNewLine()
        this.out(line);
    }
}

export class APIGenerator {
    graph: Graph

    constructor(graph: Graph) {
        this.graph = graph;
    }

    generateMethods(writer: JavascriptCodeWriter) {
        const verboseLogging = this.graph.getRelationsSync('code-generation verbose-logging').length > 0;

        for (const touchpoint of this.graph.getRelationsSync('touchpoint/*')) {

            const name = this.graph.getOneRelationSync(`${touchpoint.getTag('touchpoint')} .functionName`).getValue()
            writer.startFunction(name, writer => {
                for (const input of this.graph.getRelationsSync(`${touchpoint.getTag('touchpoint')} input/*`)) {
                    const name = this.graph.getOneRelationSync(`${input.getTag('input')} .name`).getValue()
                    const inputType = this.graph.getOneRelationOptionalSync(`${input.getTag('input')} .name`);
                    writer.writeInput(name)
                }
            });

            const queryStr = this.graph.getOneRelationSync(`${touchpoint.getTag('touchpoint')} query`).getValue()
            writer.writeLine(`// Run query search`)
            writer.writeLine(`const queryStr = \`${queryStr}\`;`);

            if (verboseLogging) {
                writer.writeLine();
                writer.writeLine(`console.log('Running query: ' + queryStr)`);
            }

            writer.writeLine('const rels: Relation[] = this.graph.getRelationsSync(queryStr);');

            if (verboseLogging) {
                writer.writeLine();
                writer.writeLine(`console.log('Got results: [' + rels.map(rel => rel.str()).join(', ') + ']')`)
            }


            const expectOne = this.graph.getRelationsSync(`${touchpoint.getTag('touchpoint')} expectOne`).length > 0;

            if (expectOne) {
                writer.writeLine()
                writer.writeLine('// Expect one result')
                writer.writeLine('if (rels.length === 0) {')
                writer.increaseIndent()
                writer.writeLine(`throw new Error("No relation found for: " + queryStr)`)
                writer.decreaseIndent()
                writer.writeLine('}')
                writer.writeLine()
                writer.writeLine('if (rels.length > 1) {')
                writer.increaseIndent()
                writer.writeLine(`throw new Error("Multiple results found for: " + queryStr)`)
                writer.decreaseIndent()
                writer.writeLine('}')
                writer.writeLine()
                
                writer.writeLine('const rel = rels[0];');

                const outputValue = this.graph.getRelationsSync(`${touchpoint.getTag('touchpoint')} outputValue`).length > 0;

                if (outputValue) {
                    writer.writeLine('return rel.getValue();');
                } else {
                    writer.writeLine('return rels.map(rel => rel.getValue())')
                }
            } else {
                // TODO
            }

            writer.finishFunction()
        }
    }

    asJavascript() {
        const methodText = [];
        const writer = new JavascriptCodeWriter();
        writer.indentLevel = 1;
        writer.out = (s) => { methodText.push(s) }

        this.generateMethods(writer);
        
        return javascriptTemplate({
            methodSource: methodText.join('')
        });
    }
}

function writeIfChanges(filename: string, contents: string) {
    const existing = Fs.readFileSync(filename, 'utf8')

    if (contents === existing)
        return false;

    Fs.writeFileSync(filename, contents);
    return true;
}

export function generateAPI(graph: Graph) {

    console.log('generateAPI starting..');

    const destinationFilename = graph.getOneRelationSync('code-generation destination-filename').getValue()


    const generator = new APIGenerator(graph);

    writeIfChanges(destinationFilename, generator.asJavascript());
    console.log('file is up to date: ' + destinationFilename);

    console.log('generateAPI done');
}

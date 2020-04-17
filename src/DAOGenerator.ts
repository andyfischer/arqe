
import Graph from './Graph'
import { writeFileSyncIfUnchanged } from './context/fs'
import DAOGeneratorGeneratedDAO from './DAOGeneratorGeneratedDAO'

function javascriptTemplate(vars) {
    return (
`import { GraphLike, Relation } from '${vars.ikImport}'

export default class API {
    graph: GraphLike

    constructor(graph: GraphLike) {
        this.graph = graph;
    }
${vars.methodSource}
}
`);
}

class JavascriptCodeWriter {
    writeOut: (s: string) => void

    needsNewline = false
    inputsNeedComma = false
    indentLevel: number

    indent() {
        this.indentLevel += 1;
        return this;
    }

    unindent() {
        this.indentLevel -= 1;
        return this;
    }

    startNewLine() {
        if (this.needsNewline)
            this.writeOut('\n');

        for (let i = 0; i < this.indentLevel; i++)
            this.writeOut('    ')

        this.needsNewline = true;
    }

    defineMethod(funcName: string, outputType: string | null, writeInputs: (writer: JavascriptCodeWriter) => void) {
        this.line()
        this.startNewLine()
        this.writeOut(funcName);

        this.writeOut('(')
        writeInputs(this)
        this.inputsNeedComma = false;
        this.writeOut(')')
        if (outputType) {
            this.writeOut(': ')
            this.writeOut(outputType);
        }
        this.writeOut(' {')
        this.indentLevel += 1;
        return this;
    }

    writeInput(name: string, typeName?: string) {
        if (this.inputsNeedComma)
            this.writeOut(', ')

        this.writeOut(name);

        if (typeName) {
            this.writeOut(': ')
            this.writeOut(typeName);
        }

        this.inputsNeedComma = true;
    }

    endBlock() {
        this.indentLevel -= 1;
        this.startNewLine()
        this.writeOut('}')
        return this;
    }

    line(line: string = '') {
        this.startNewLine()
        this.writeOut(line);
        return this;
    }

    If(condition: string) {
        this.line(`if (${condition}) {`);
        this.indent();
        return this;
    }
}

export class DAOGenerator {
    target: string
    api: DAOGeneratorGeneratedDAO
    destinationFilename: string
    verboseLogging: boolean

    constructor(api: DAOGeneratorGeneratedDAO, target: string) {
        this.api = api;
        this.target = target;

        this.destinationFilename = this.api.getDestinationFilename(this.target)
        this.verboseLogging = this.api.enableVerboseLogging(this.target);
    }
    
    generateFullQuery(writer: JavascriptCodeWriter, touchpoint: string) {
        const queryStr = this.api.touchpointQueryString(touchpoint);
        const name = this.api.touchpointFunctionName(touchpoint);

        const usesOutput = true;

        const inputs = this.sortInputs(this.api.touchpointInputs(touchpoint));

        writer.defineMethod(name, null, writer => {
            for (const input of inputs) {
                const name = this.api.inputName(input);
                const inputType = this.api.inputType(input);

                if (inputType)
                    writer.writeInput(name, inputType)
            }
        });

        for (const input of inputs) {
            const name = this.api.inputName(input);
            const tagType = this.api.inputTagType(input);
            if (tagType) {
                writer.If(`!${name}.startsWith("${tagType}/")`)
                    .line(`throw new Error('Expected "${tagType}/...", saw: ' + ${name});`)
                    .unindent()
                    .line('}')
                    .line();
            }
        }

        writer.line(`const queryStr = \`${queryStr}\`;`);
        if (usesOutput) {
            writer.line('const rels = this.graph.runSync(queryStr)')
            writer.line('    .filter(rel => !rel.hasType("command-meta"));');
        } else {
            writer.line('this.graph.runSync(queryStr);')
        }
        writer.line();

        this.relationCountGuards(writer, touchpoint);
        this.returnResult(writer, touchpoint);

        writer.endBlock();
    }

    relationCountGuards(writer: JavascriptCodeWriter, touchpoint: string) {
        const expectOne = this.api.touchpointExpectOne(touchpoint);
        const outputIsOptional = this.api.touchpointOutputIsOptional(touchpoint);

        if (expectOne) {
            if (!outputIsOptional)
                writer.line('// Expect one result')

            writer.line('if (rels.length === 0) {')
            writer.indent()

            if (outputIsOptional)
                writer.line(`return null;`)
            else
                writer.line(`throw new Error("No relation found for: " + queryStr)`)

            writer.unindent()
            writer.line('}')
            writer.line()
            writer.line('if (rels.length > 1) {')
                .indent()
                .line(`throw new Error("Multiple results found for: " + queryStr)`)
                .unindent()
                .line('}')
                .line()
                .line('const rel = rels[0];')
                .line();
        }
    }

    returnOneResult(writer: JavascriptCodeWriter, touchpoint: string) {
        const outputIsValue = this.api.touchpointOutputIsValue(touchpoint);

        if (outputIsValue) {
            writer.line('return rel.getPayload();');
            return;
        }

        const outputObject = this.api.touchpointOutputObject(touchpoint);

        if (outputObject) {
            writer.line();
            writer.line('return {');
            writer.indent();

            for (const { field, tagValue } of this.api.outputObjectTagValueFields(outputObject)) {
                writer.line(`${field}: rel.getTagValue("${tagValue}"),`);
            }
            
            for (const { field, tag } of this.api.outputObjectTagFields(outputObject)) {
                writer.line(`${field}: rel.getTag("${tag}"),`);
            }

            writer.unindent();
            writer.line('}');
            return;
        }

        const tagValueOutput = this.api.touchpointTagValueOutput(touchpoint);
        if (tagValueOutput) {
            writer.line(`return rel.getTagValue("${tagValueOutput}");`)
            return;
        }

        const tagOutput = this.api.touchpointTagOutput(touchpoint);
        if (tagOutput) {
            writer.line(`return rel.getTag("${tagOutput}");`);
            return;
        }

        writer.line('// no output')
    }

    returnResult(writer: JavascriptCodeWriter, touchpoint: string) {
        const expectOne = this.api.touchpointExpectOne(touchpoint);

        if (expectOne)
            return this.returnOneResult(writer, touchpoint);

        writer.line('// TODO - handle multi results')
    }

    sortInputs(inputs: string[]) {
        if (inputs.length < 2)
            return inputs;

        inputs.sort();

        const entries = inputs.map(input => {

            const out = {
                input
            }

            const sortOrder = this.api.inputSortOrder(input);

            return {
                input,
                sortOrder: sortOrder ? parseFloat(sortOrder) : 0
            }
        });

        entries.sort((a,b) => 
            a.sortOrder - b.sortOrder
        );

        return entries.map(entry => entry.input);
    }

    generateMethod(writer: JavascriptCodeWriter, touchpoint: string) {

        const queryStr = this.api.touchpointQueryString(touchpoint);

        if (!queryStr)
            throw new Error(`couldn't find query for: ` + touchpoint);

        if (queryStr.startsWith('get ')
                || queryStr.startsWith('set ')
                || queryStr.startsWith('delete ')) {
            this.generateFullQuery(writer, touchpoint);
            return;
        }

        const name = this.api.touchpointFunctionName(touchpoint);
        const expectOne = this.api.touchpointExpectOne(touchpoint);
        const isAsync = this.api.touchpointIsAsync(touchpoint);
        const outputIsOptional = this.api.touchpointOutputIsOptional(touchpoint);
        const outputIsValue = this.api.touchpointOutputIsValue(touchpoint);
        const outputObject = this.api.touchpointOutputObject(touchpoint);
        const outputExists = this.api.touchpointOutputIsExists(touchpoint);
        const tagValueOutput = this.api.touchpointTagValueOutput(touchpoint);
        const tagOutput = this.api.touchpointTagOutput(touchpoint);
        const outputType = this.api.touchpointOutputType(touchpoint);

        let outputTypeStr = null;

        if (outputExists) {
            outputTypeStr = 'boolean'
        } else {
            if (outputType) {
                outputTypeStr = outputType;
            } else if (outputObject) {
                outputTypeStr = null;
            } else {
                outputTypeStr = 'string'
            }

            if (!expectOne && outputTypeStr !== null)
                outputTypeStr += '[]'
        }

        writer.defineMethod(name, outputTypeStr, writer => {

            const inputs = this.sortInputs(this.api.touchpointInputs(touchpoint));

            for (const input of inputs) {
                const name = this.api.inputName(input);
                const inputType = this.api.inputType(input);

                if (inputType)
                    writer.writeInput(name, inputType)
            }
        });

        writer.line(`const command = \`get ${queryStr}\`;`);

        if (this.verboseLogging) {
            writer.line();
            writer.line(`console.log('Running query (for ${name}): ' + command)`);
        }

        writer.line(`const rels: Relation[] = this.graph.runSync(command)`);
        writer.line('    .filter(rel => !rel.hasType("command-meta"));');
        

        if (this.verboseLogging) {
            writer.line();
            writer.line(`console.log('Got results: [' + rels.map(rel => rel.str()).join(', ') + ']')`)
        }

        if (outputExists) {
            writer.line('return rels.length > 0;');
        } else if (expectOne) {
            writer.line()

            if (!outputIsOptional)
                writer.line('// Expect one result')

            writer.line('if (rels.length === 0) {')
            writer.indent()

            if (outputIsOptional)
                writer.line(`return null;`)
            else
                writer.line(`throw new Error("No relation found for: " + command)`)

            writer.unindent()
            writer.line('}')
            writer.line()
            writer.line('if (rels.length > 1) {')
            writer.indent()
            writer.line(`throw new Error("Multiple results found for: " + command)`)
            writer.unindent()
            writer.line('}')
            writer.line()
            
            writer.line('const rel = rels[0];');

            if (outputIsValue) {
                writer.line('return rel.getPayload();');
            } else if (outputObject) {
                writer.line();
                writer.line('return {');
                writer.indent();

                for (const { field, tagValue } of this.api.outputObjectTagValueFields(outputObject)) {
                    writer.line(`${field}: rel.getTagValue("${tagValue}"),`);
                }
                
                for (const { field, tag } of this.api.outputObjectTagFields(outputObject)) {
                    writer.line(`${field}: rel.getTag("${tag}"),`);
                }

                writer.unindent();
                writer.line('}');

            } else if (tagValueOutput) {
                writer.line(`return rel.getTagValue("${tagValueOutput}");`)
            } else if (tagOutput) {
                writer.line(`return rel.getTag("${tagOutput}");`)

            } else {
                writer.line('// no output')
            }
        } else {
            if (tagValueOutput) {
                let returnStr = `return rels.map(rel => rel.getTagValue("${tagValueOutput}"))`

                if (outputType === 'integer') {
                    returnStr += '.map(str => parseInt(str, 10))'
                }

                returnStr += ';'

                writer.line(returnStr)
            } else if (outputObject) {

                writer.line();
                writer.line('return rels.map(rel => ({');
                writer.indent();

                for (const { field, tagValue } of this.api.outputObjectFields(outputObject)) {
                    writer.line(`${field}: rel.getTagValue("${tagValue}"),`);
                }

                writer.unindent();
                writer.line('}));');

            } else if (tagOutput) {
                writer.line(`return rels.map(rel => rel.getTag("${tagOutput}"));`)

            } else {

                if (outputType === 'object') {
                    writer.line('return rels.map(rel => ({')
                    writer.indent()

                    const objectdef = this.api.getOutputObjectdef(touchpoint);

                    writer.line('return rels.map(rel => ({')

                    for (const objectField of this.api.getObjectdefFields(objectdef)) {
                    }

                } else {
                    writer.line('return rels.map(rel => rel.getPayload())')
                }
            }
        }

        writer.endBlock()
    }

    generateMethods(writer: JavascriptCodeWriter) {

        for (const touchpoint of this.api.listTouchpoints(this.target)) {
            this.generateMethod(writer, touchpoint);
        }
    }

    asJavascript() {
        const methodText = [];
        const writer = new JavascriptCodeWriter();
        writer.indentLevel = 1;
        writer.writeOut = (s) => { methodText.push(s) }

        this.generateMethods(writer);
        
        return javascriptTemplate({
            ikImport: this.api.getIkImport(this.target),
            methodSource: methodText.join('')
        });
    }
}

export function generateAPI(graph: Graph, target: string) {

    const api = new DAOGeneratorGeneratedDAO(graph);

    const generator = new DAOGenerator(api, target);

    writeFileSyncIfUnchanged(generator.destinationFilename, generator.asJavascript());
    console.log('generated file is up-to-date: ' + generator.destinationFilename);
}

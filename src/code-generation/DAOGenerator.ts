
import Graph from '../Graph'
import { writeFileSyncIfUnchanged } from '../platform/fs'
import DAOGeneratorDAO from './generated/DAOGeneratorDAO'
import { startFile, startObjectLiteral, Block, formatBlock } from './JavascriptAst'

interface InputDef {
    name: string
    inputType?: string
}

function sortInputs(api: DAOGeneratorDAO, inputs: string[]) {
    if (inputs.length < 2)
        return inputs;

    inputs.sort();

    const entries = inputs.map(input => {

        const out = {
            input
        }

        const sortOrder = api.inputSortOrder(input);

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

function getTouchpointOutputType(api: DAOGeneratorDAO, touchpoint: string) {
    const outputExists = api.touchpointOutputIsExists(touchpoint);
    const outputFrom = api.touchpointOutputs(touchpoint);
    const expectOne = api.touchpointExpectOne(touchpoint);
    const isAsync = api.touchpointIsAsync(touchpoint);
    const outputObject = api.touchpointOutputObject(touchpoint);

    if (api.touchpointIsListener(touchpoint))
        return null;

    let outputTypeStr = null;

    if (outputExists) {
        outputTypeStr = 'boolean';
    } else if (outputObject) {
        outputTypeStr = null;
    } else if (outputFrom.length === 1) {
        outputTypeStr = 'string'
    }

    if (!expectOne && outputTypeStr !== null && !outputExists)
        outputTypeStr += '[]'

    if (isAsync && outputTypeStr !== null)
        outputTypeStr = `Promise<${outputTypeStr}>`;

    return outputTypeStr;
}

function getTypeForListenerCallback(api: DAOGeneratorDAO, touchpoint: string) {
    const outputFrom = api.touchpointOutput(touchpoint);

    if (outputFrom) {
        const varName = outputFrom.replace('/*', '');
        return `(${varName}: string) => void`
    }

    return `(rel: Relation) => void`
}

function defineMethod(api: DAOGeneratorDAO, block: Block, touchpoint: string) {

    const touchpointStyle = api.touchpointStyle(touchpoint);
    if (touchpointStyle === 'eventListener') {
        defineEventListener(api, block, touchpoint);
        return;
    }

    const queryStr = api.touchpointQueryString(touchpoint);

    if (!queryStr)
        throw new Error(`couldn't find query for: ` + touchpoint);

    let command = queryStr;

    if (!queryStr.startsWith('get ')
            && !queryStr.startsWith('set ')
            && !queryStr.startsWith('delete ')
            && !queryStr.startsWith('listen ')) {
        command = 'get ' + queryStr;
    }

    // const verboseLogging = api.enableVerboseLogging(target);
    const name = api.touchpointFunctionName(touchpoint);
    const expectOne = api.touchpointExpectOne(touchpoint);
    const isAsync = api.touchpointIsAsync(touchpoint);
    const outputIsOptional = api.touchpointOutputIsOptional(touchpoint);
    const outputObject = api.touchpointOutputObject(touchpoint);
    const outputExists = api.touchpointOutputIsExists(touchpoint);

    const func = block.addMethod(name);

    if (isAsync)
        func.isAsync = true;

    const outputType = getTouchpointOutputType(api, touchpoint);
    if (outputType)
        func.setOutputType(outputType);

    for (const { varStr, typeStr } of api.touchpointInputs2(touchpoint)) {

        const dataFrom = api.touchpointInputDataFrom(touchpoint, varStr);
        if (dataFrom && dataFrom === 'apiObject') {
            func.contents.addRaw(`const ${varStr} = this.${varStr};`);
            continue;
        }

        func.addInput(varStr, typeStr);
    }

    if (api.touchpointIsListener(touchpoint))
        func.addInput('callback', getTypeForListenerCallback(api, touchpoint));

    func.contents.addRaw(`const command = \`${command}\`;`);
    func.contents.addBlank();

    /*if (verboseLogging) {
        block.addBlank();
        block.addRaw(`console.log('Running query (for ${name}): ' + command)`);
    }*/

    if (api.touchpointIsListener(touchpoint)) {
        methodBodyForListener(api, touchpoint, func.contents);
        return;
    }

    // Fetch relations
    if (isAsync) {
        func.contents.addRaw(`const { receiver, promise } = receiveToRelationListPromise();`);
        func.contents.addRaw(`this.graph.run(command, receiver)`);
        func.contents.addRaw(`const rels: Relation[] = (await promise)`);

    } else {
        func.contents.addRaw(`const rels: Relation[] = this.graph.runSync(command)`);
    }

    func.contents.addRaw('    .filter(rel => !rel.hasType("command-meta"));');

    func.contents.addBlank();

    // Return output
    methodReturnResult(api, touchpoint, func.contents);
}

function defineEventListener(api: DAOGeneratorDAO, block: Block, touchpoint: string) {

    const name = api.touchpointFunctionName(touchpoint);
    const func = block.addMethod(name);
    const contents = func.contents;

    func.addInput('handler', '(evt) => void');

    for (const eventType of api.touchpointEventTypes(touchpoint)) {
        const id = api.eventTypeId(eventType);

        const handlerInput = startObjectLiteral();
        handlerInput.addObjectField('id', `'${id}'`);

        for (const { fromStr, varStr } of api.eventTypeProvides(eventType)) {
            handlerInput.addObjectField(varStr, oneRelationOutputExpression(api, fromStr));
        }

        formatBlock(handlerInput);

        const provides = api.eventTypeProvides(eventType);

        contents.addBlank();
        contents.addRaw('// ' + eventType);

        contents.addRaw(`this.graph.run("${api.eventTypeQuery(eventType)}", {`);
        contents.addRaw('    relation(rel: Relation) {')

        if (api.eventTypeIsDeletion(eventType)) {
            contents.addRaw(`        if (rel.hasType('command-meta') && rel.hasType('deleted')) {`)
            contents.addRaw(`            handler(${handlerInput.stringify()});`)
            contents.addRaw(`        }`);
        } else {
            contents.addRaw(`        if (rel.hasType('command-meta'))`);
            contents.addRaw(`            return;`);
            contents.addRaw(`        handler(${handlerInput.stringify()});`);
        }

        contents.addRaw(`    },`)
        contents.addRaw(`    finish() { }`)
        contents.addRaw(`});`);
    }
}

function oneRelationOutputExpression(api: DAOGeneratorDAO, fromStr: string, relVarName = 'rel') {
    if (fromStr.endsWith('/*')) {
        return `${relVarName}.getTagValue("${fromStr.replace('/*', '')}")`
    } else {
        return `${relVarName}.getTag("${fromStr}")`
    }
}

function relationOutputExpression(api: DAOGeneratorDAO, touchpoint: string, relVarName = 'rel') {
    const outputs = api.touchpointOutputs2(touchpoint);

    if (outputs.length === 1) {
        return oneRelationOutputExpression(api, outputs[0].fromStr, relVarName);
    }

    if (outputs.length > 1) {
        let out = '({\n';

        for (const { fromStr, varStr } of outputs) {
            out += `    ${varStr}: ${oneRelationOutputExpression(api, fromStr, relVarName)},\n`;
        }

        out += '})';
        return out;
    }

    return `rel`;
}

function methodBodyForListener(api: DAOGeneratorDAO, touchpoint: string, block: Block) {
    block.addRaw('this.graph.run(command, {')
    block.addRaw('    relation(rel: Relation) {')
    block.addRaw(`        if (rel.hasType('command-meta'))`)
    block.addRaw(`            return;`)
    block.addRaw(`        callback(${relationOutputExpression(api, touchpoint)});`)
    block.addRaw(`    },`)
    block.addRaw(`    finish() { }`)
    block.addRaw(`});`);
}

function methodReturnResult(api: DAOGeneratorDAO, touchpoint: string, block: Block) {
    const name = api.touchpointFunctionName(touchpoint);
    const expectOne = api.touchpointExpectOne(touchpoint);
    const isAsync = api.touchpointIsAsync(touchpoint);
    const outputIsOptional = api.touchpointOutputIsOptional(touchpoint);
    const outputObject = api.touchpointOutputObject(touchpoint);
    const outputExists = api.touchpointOutputIsExists(touchpoint);
    const outputFrom = api.touchpointOutputs(touchpoint);

    if (outputExists) {
        block.addRaw('return rels.length > 0;');
        return;
    }
        
    if (expectOne) {
        if (!outputIsOptional)
            block.addRaw('// Expect one result')

        const zeroCheck = block._if();
        zeroCheck.setCondition('rels.length === 0');

        if (outputIsOptional)
            zeroCheck.contents.addRaw(`return null;`)
        else
            zeroCheck.contents.addRaw(`throw new Error("(${name}) No relation found for: " + command)`)

        const multiCheck = block._if();
        multiCheck.setCondition('rels.length > 1');
        multiCheck.contents.addRaw(`throw new Error("(${name}) Multiple results found for: " + command)`)
        
        block.addRaw('const oneRel = rels[0];');

        if (outputObject) {
            block.addRaw('return {');

            for (const { field, tagValue } of api.outputObjectTagValueFields(outputObject)) {
                block.addRaw(`    ${field}: oneRel.getTagValue("${tagValue}"),`);
            }
            
            for (const { field, tag } of api.outputObjectTagFields(outputObject)) {
                block.addRaw(`    ${field}: oneRel.getTag("${tag}"),`);
            }

            block.addRaw('}');

        } else if (outputFrom.length > 0) {
            block.addRaw(`return ${relationOutputExpression(api, touchpoint, 'oneRel')};`);

        } else {
            block.addRaw('// no output')
        }

        return;
    }

    if (outputFrom.length > 0) {
        let returnStr = `return rels.map(rel => ${relationOutputExpression(api, touchpoint)});`
        block.addRaw(returnStr)
        return;
    }

    if (outputObject) {

        block.addRaw('return rels.map(rel => ({');

        for (const { field, tagValue } of api.outputObjectFields(outputObject)) {
            block.addRaw(`    ${field}: rel.getTagValue("${tagValue}"),`);
        }

        block.addRaw('}));');

        return;
    }

    block.addRaw('// no output?');
}

function createFileAst(api: DAOGeneratorDAO, target: string) {
    const file = startFile();
    const importPath = api.getIkImport(target);
    file.addImport('{ GraphLike, Relation, receiveToRelationListPromise }', importPath);

    const apiClass = file.addClass('API');
    apiClass.isExportDefault = true;
    apiClass.addField('graph', 'GraphLike');

    for (const { field, typeStr } of api.getInterfaceFields(target)) {
        apiClass.addField(field, typeStr);
    }

    const contructorFunc = apiClass.contents.addMethod('constructor');
    contructorFunc.addInput('graph', 'GraphLike');
    contructorFunc.contents._if(`typeof graph.run !== 'function'`)
        .contents
        .addLine(`throw new Error('(${target} constructor) expected Graph or GraphLike: ' + graph);`);

    contructorFunc.contents.addRaw('this.graph = graph;');

    // methods
    for (const touchpoint of api.listTouchpoints(target)) {
        defineMethod(api, apiClass.contents, touchpoint);
    }

    return file;
}

export function runDAOGenerator(graph: Graph, target: string) {

    const api = new DAOGeneratorDAO(graph);
    const ast = createFileAst(api, target);
    formatBlock(ast);
    const destinationFilename = api.getDestinationFilename(target)
    writeFileSyncIfUnchanged(destinationFilename, ast.stringify());
    console.log('generated file is up-to-date: ' + destinationFilename);
}


import Graph from '../Graph'
import { startFile, startObjectLiteral, Block, formatBlock, startFunctionTypeDef } from './JavascriptAst'
import ProviderGeneratorDAO from './generated/ProviderGeneratorDAO'
import { writeFileSyncIfUnchanged } from '../platform/fs'
import Pattern from '../Pattern'
import parseCommand, { parsePattern } from '../parseCommand'

function createHandlerInterface(api: ProviderGeneratorDAO, file: Block) {
    const handlerInterface = file.addInterface('NativeHandler');

    for (const handler of api.listHandlers()) {
        const functionName = api.touchpointFunctionName(handler);
        const outputExpectOne = api.touchpointOutputExpectOne(handler);
        const outputs = api.touchpointOutputs2(handler);
        const isAsync =  api.touchpointIsAsync(handler);

        const functionType = startFunctionTypeDef();

        for (const { varStr, typeStr } of api.touchpointInputs2(handler)) {
            functionType.addInput(varStr, typeStr);
        }

        let outputType = api.touchpointOutputWithType(handler);

        if (!outputType && outputs.length > 0)
            outputType = 'any';

        if (outputType) {

            if (!outputExpectOne && !outputType.endsWith('[]'))
                outputType = outputType + '[]';

            if (isAsync)
                outputType = `Promise<${outputType}>`;

            functionType.setOutputType(outputType);
        }


        handlerInterface.addField(functionName, functionType.line());
    }
}

function createFileAst(api: ProviderGeneratorDAO, target: string) {
    const file = startFile();
    const importPath = api.getIkImport(target);
    file.addImport('{ GraphLike, Relation, Pattern, RelationReceiver, StorageProvider, emitCommandError }', importPath);

    createHandlerInterface(api, file);

    const apiClass = file.addClass('API');
    apiClass.addField('handler', 'NativeHandler');
    apiClass.isExportDefault = true;
    apiClass.addImplements('StorageProvider');

    const contructorFunc = apiClass.contents.addMethod('constructor');
    contructorFunc.addInput('handler', 'NativeHandler');
    contructorFunc.contents.addRaw('this.handler = handler;');

    /*
    const handlesPatternMethod = apiClass.contents.addMethod('handlesPattern');
    handlesPatternMethod.addInput('pattern', 'Pattern');
    const handlesPattern = parsePattern(api.getHandlesPattern(target));
    handlesPatternMethod.setOutputType('boolean');
    const handlesPatternIf = handlesPatternMethod.contents._if();
    handlesPatternIf.setCondition(patternCheckExpression(handlesPattern));
    handlesPatternIf.contents.addRaw('return true;');
    handlesPatternMethod.contents.addRaw('return false;');
    */

    const runSearch = apiClass.contents.addMethod('runSearch');
    runSearch.isAsync = true;
    runSearch.addInput('pattern', 'Pattern');
    runSearch.addInput('output', 'RelationReceiver');

    const runSave = apiClass.contents.addMethod('runSave');
    runSave.isAsync = true;
    runSave.addInput('pattern', 'Pattern');
    runSave.addInput('output', 'RelationReceiver');

    const runDelete = apiClass.contents.addMethod('runDelete');
    runDelete.isAsync = true;
    runDelete.addInput('pattern', 'Pattern');
    runDelete.addInput('output', 'RelationReceiver');

    for (const handler of api.listHandlers()) {
        const query = api.handlerQuery(handler);
        if (query.startsWith('get ')) {
            addPatternCheck(api, runSearch.contents, handler);
        } else if (query.startsWith('set ')) {
            addPatternCheck(api, runSave.contents, handler);
        } else if (query.startsWith('delete ')) {
            addPatternCheck(api, runDelete.contents, handler);
        } else {
            throw new Error(`don't know how to handle query: ${query}`);
        }
    }

    for (const { relevantCommand, method } of [
        { relevantCommand: 'get', method: runSearch },
        { relevantCommand: 'set', method: runSave },
        { relevantCommand: 'delete', method: runDelete }]) {

        method.contents.addRaw(`emitCommandError(output, "provider ${target} doesn't support: ${relevantCommand} " + pattern.stringify());`);
        method.contents.addRaw(`output.finish()`);
    }

    return file;
}

function patternCheckExpression(pattern: Pattern) {
    const conditions = [];

    if (pattern.hasDoubleStar) {
        conditions.push(`pattern.tagCount() >= ${pattern.tagCount()}`);
    } else {
        conditions.push(`pattern.tagCount() == ${pattern.tagCount()}`);
    }

    for (const tag of pattern.tags) {
        if (tag.doubleStar)
            continue;

        conditions.push(`pattern.hasType("${tag.tagType}")`);
        if (tag.identifier) {
            conditions.push(`pattern.hasValueForType("${tag.tagType}")`);
        } else if (tag.tagValue) {
            conditions.push(`pattern.getTagValue("${tag.tagType}") == "${tag.tagValue}"`);
        }
    }

    return conditions.map(c => `(${c})`).join(' && ');
}

function pullOutVarsFromPattern(pattern: Pattern, block: Block) {

    const vars: string[] = [];

    for (const tag of pattern.tags) {
        if (tag.identifier) {
            block.addRaw(`const ${tag.identifier} = pattern.getTagValue("${tag.tagType}");`);
            vars.push(tag.identifier);
        }
    }

    return vars;
}

function* iterateWithFirstLast(list: any[]) {
    for (let i = 0; i < list.length; i++) {
        yield { isFirst: (i === 0), item: list[i], isLast: (i === list.length - 1) };
    }
}

function addPatternCheck(api: ProviderGeneratorDAO, block: Block, handler: string) {
    const query = api.handlerQuery(handler);
    const command = parseCommand(query);
    const pattern = command.pattern;

    block.addComment(`check for ${handler} (${query})`);

    const patternMatches = block._if();
    patternMatches.setCondition(patternCheckExpression(pattern));
    const handlePatternMatch = patternMatches.contents;

    const functionName = api.touchpointFunctionName(handler);
    const vars = pullOutVarsFromPattern(pattern, handlePatternMatch);
    const outputs = api.touchpointOutputs2(handler);
    const isAsync =  api.touchpointIsAsync(handler);
    const outputExpectOne = api.touchpointOutputExpectOne(handler);

    let outputVar = null;

    if (outputs.length === 1) {
        outputVar = outputs[0].varStr;
    }

    if (outputs.length > 1) {
        outputVar = 'result';
    }

    // Add the handler call
    let handlerCall = `this.handler.${functionName}(${vars.join(', ')});`;

    if (isAsync)
        handlerCall = `await ` + handlerCall;

    if (outputVar)
        handlerCall = `const ${outputVar} = ` + handlerCall;

    handlePatternMatch.addRaw(handlerCall);

    // Handle output
    if (outputs.length === 0) {
        if (query.startsWith('set ')) {
            // If save: Just echo back the relation that was saved.
            handlePatternMatch.addRaw(`output.relation(pattern);`);
            handlePatternMatch.addRaw(`output.finish();`);
            handlePatternMatch.addRaw(`return;`);
        }
        block.addBlank();
        return;
    }

    // Type check the received value
    if (outputExpectOne) {
        if (outputs.length === 1) {
            handlePatternMatch._if(`typeof ${outputVar} !== 'string'`)
                .contents
                .addRaw(`throw new Error("expected ${functionName} to return a string, got: " + JSON.stringify(${outputVar}))`);
        }
    } else {
        handlePatternMatch._if(`!Array.isArray(${outputVar})`)
            .contents
            .addRaw(`throw new Error("expected ${functionName} to return an Array, got: " + JSON.stringify(${outputVar}))`);
    }

    let sendOneRelation = handlePatternMatch;
    let oneResultVar = outputVar;

    // Maybe start a for loop, depending on whether we expect multi results from the handler.
    if (!outputExpectOne) {
        sendOneRelation = handlePatternMatch._for(`const item of ${outputVar}`).contents;
        oneResultVar = 'item';
    }

    // For each result row, extract the fields into 'outRelation'.
    // Create 'outRelation' and fill it with data returned by the callback.
    for (const { isFirst, isLast, item } of iterateWithFirstLast(outputs)) {
        const varStr = item.varStr;
        const tagType = item.fromStr.replace('/*', '');
        if (outputs.length === 1) {
            sendOneRelation.addRaw(`const outRelation = pattern.setTagValueForType("${tagType}", ${outputVar});`);
        } else {
            if (isFirst)
                sendOneRelation.addRaw('const outRelation = pattern');

            sendOneRelation.addRaw(`    .setTagValueForType("${tagType}", ${oneResultVar}.${varStr})` + (isLast ? ';' : ''));
        }
    }

    sendOneRelation
        .addRaw(`output.relation(outRelation);`);

    handlePatternMatch
        .addRaw(`output.finish();`)
        .addRaw(`return;`);

    block.addBlank();
}

export function runProviderGenerator(graph: Graph, target: string) {
    const api = new ProviderGeneratorDAO(graph);
    api.target = target;

    const ast = createFileAst(api, target);
    formatBlock(ast);
    const destinationFilename = api.getDestinationFilename(target)
    writeFileSyncIfUnchanged(destinationFilename, ast.stringify());
    console.log('generated file is up-to-date: ' + destinationFilename);
}

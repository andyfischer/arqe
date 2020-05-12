
import Graph from '../Graph'
import { startFile, startObjectLiteral, Block, formatBlock, startFunctionTypeDef } from './JavascriptAst'
import StorageHandlerGeneratorAPI from './StorageHandlerGeneratorAPI'
import { writeFileSyncIfUnchanged } from '../context/fs'

function createHandlerInterface(api: StorageHandlerGeneratorAPI, file: Block) {
    const handlerInterface = file.addInterface('NativeHandler');

    for (const handler of api.listHandlers()) {
        const functionName = api.touchpointFunctionName(handler);

        const functionType = startFunctionTypeDef();

        for (const { varStr, typeStr } of api.touchpointInputs2(handler)) {
            functionType.addInput(varStr, typeStr);
        }

        const output = api.touchpointOutputWithType(handler);
        if (output) {
            functionType.setOutputType(output);
        }

        handlerInterface.addField(functionName, functionType.line());
    }
}

function createFileAst(api: StorageHandlerGeneratorAPI, target: string) {
    const file = startFile();
    const importPath = api.getIkImport(target);
    file.addImport('{ GraphLike, Relation, receiveToRelationListPromise }', importPath);

    createHandlerInterface(api, file);

    const apiClass = file.addClass('API');
    apiClass.isExportDefault = true;

    return file;
}

export function runStorageHandlerGenerator(graph: Graph, target: string) {
    const api = new StorageHandlerGeneratorAPI(graph);
    api.target = target;

    const ast = createFileAst(api, target);
    formatBlock(ast);
    const destinationFilename = api.getDestinationFilename(target)
    writeFileSyncIfUnchanged(destinationFilename, ast.stringify());
    console.log('generated file is up-to-date: ' + destinationFilename);
}

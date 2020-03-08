
import Graph from '../Graph'
import TextAsCodeApi from './TextAsCodeApi'
import { readFileSync, writeFileSyncIfUnchanged } from '../context/fs'

function javascriptTemplate(vars) {
    const text = vars.text
        .replace(/\$/g, "\\$");

    return (
`export default \`${text}\``
    );
}

export function generateTextAsCode(graph: Graph, target: string) {
    const api = new TextAsCodeApi(graph);
    const fromFile = api.fromFile(target);
    const destinationFilename = api.destinationFilename(target);
    const text = readFileSync(fromFile, 'utf8');
    const jsContents = javascriptTemplate({text});
    writeFileSyncIfUnchanged(destinationFilename, jsContents);
    console.log('generated file is up-to-date: ' + destinationFilename);
}


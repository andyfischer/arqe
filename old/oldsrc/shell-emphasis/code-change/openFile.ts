
import { tokenizeString } from '../lexer'
import CodeFile from './CodeFile'

type Operation = 'insert'

export default async function openFileForEdit(filename: string): Promise<CodeFile> {
    const script = new CodeFile()
    await script.readFile(filename);
    return script;
}

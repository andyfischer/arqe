
import fs from 'fs-extra'
import path from 'path'
import { TypescriptWriter } from '../codewriter/ts'

export default async function generateCommandImports() {
    const srcDir = path.join(__dirname, '../../src');
    const commandsDir = path.join(srcDir, 'commands');
    const everyFile = (await fs.readdir(commandsDir))
        .filter(file => file !== 'index.ts');

    const writer = new TypescriptWriter();
    for (let file of everyFile) {
        file = file.replace(/\.ts$/, '');
        const fromFile = `'./${file}'`;
        writer.import_(null, fromFile);
    }

    await writer.writeToFile(path.join(commandsDir, 'index.ts'));
}

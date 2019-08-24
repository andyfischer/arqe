
import fs from 'fs-extra'

class EditingScript {
    textContents: string

    async open(filename: string) {
        this.textContents = await fs.readFile(filename, 'utf8')

    }
}

export default async function openFileForEdit(filename: string): Promise<EditingScript> {
    const script = new EditingScript()
    await script.open(filename);
    return script;
}


import { CodeFile, runChangeCommand } from "..";

function toCodeFile(text: string) {
  const file = new CodeFile();
  file.readString(text);
  return file;
}

it('selects the whole line', () => {
    const file = toCodeFile(`
a = 1
b = 2
c = 3
                            `);
    const cursor = runChangeCommand(file, "find-ident b | select-line");
    expect(cursor.getSelectedText()).toEqual("b = 2");
});


import { CodeFile, runChangeCommand } from "..";

function toCodeFile(text: string) {
  const file = new CodeFile();
  file.readString(text);
  return file;
}

it('select-line selects the line', () => {
    const file = toCodeFile(`a = 1\nb = 2\nc = 3`);
    runChangeCommand(file, "select-line 2 | delete");
    expect(file.getText()).toEqual(`a = 1\nc = 3`);
});

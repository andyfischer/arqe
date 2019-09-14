
import { CodeFile, runChangeCommand } from "..";

function toCodeFile(text: string) {
  const file = new CodeFile();
  file.readString(text);
  return file;
}

it('replace replaces', () => {
    const file = toCodeFile('a = 1');
    runChangeCommand(file, 'replace from=a to=b');
    expect(file.getText()).toEqual('b = 1');
});

it('replace only replaces inside selection', () => {
    const file = toCodeFile('a = 1\na = 2');
    runChangeCommand(file, 'select-line 2 | replace from=a to=b');
    expect(file.getText()).toEqual('a = 1\nb = 2');
});

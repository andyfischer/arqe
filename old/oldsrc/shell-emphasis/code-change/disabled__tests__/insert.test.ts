
import { CodeFile, runChangeCommand } from "..";

function toCodeFile(text: string) {
  const file = new CodeFile();
  file.readString(text);
  return file;
}

it('inserts at the start of the file', () => {
    const file = toCodeFile(`a b c`);
    runChangeCommand(file, "find-ident a | insert new-a");
    expect(file.getText()).toEqual('new-a b c');
});

it('inserts in the middle of the file', () => {
    const file = toCodeFile(`new-a b c`);
    runChangeCommand(file, "find-ident b | insert new-b");
    expect(file.getText()).toEqual('new-a new-b c');
});

it('works correctly after multiple imports', () => {
    const file = toCodeFile(`a b c`);
    runChangeCommand(file, "find-ident a | insert new-a");
    runChangeCommand(file, "find-ident b | insert new-b");
    runChangeCommand(file, "find-ident c | insert new-c");
    expect(file.getText()).toEqual('new-a new-b new-c');
});

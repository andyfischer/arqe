
import CodeFile from '../CodeFile'

it("supports patching at the start of the file", () => {
    const file = new CodeFile()
    file.readString("1 2 3");
    file.patch(0, 0, "-1 0 ");
    expect(file.textContents).toEqual("-1 0 1 2 3");
});

it("supports patching in the middle of the file", () => {
    const file = new CodeFile()
    file.readString("1 2 3");
    file.patch(2, 3, "2.1");
    expect(file.textContents).toEqual("1 2.1 3");
});

it("supports patching at the end of the file", () => {
    const file = new CodeFile()
    file.readString("1 2 3");
    file.patch(5, 5, " 4 5");
    expect(file.textContents).toEqual("1 2 3 4 5");
});

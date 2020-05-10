"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const LineWriter_1 = __importDefault(require("../LineWriter"));
describe('Writer', () => {
    it('writes lines', () => {
        const writer = new LineWriter_1.default();
        writer.writeln('line 1');
        writer.writeln('line 2');
        expect(writer.getResult()).toEqual(`line 1\nline 2`);
    });
    it('.write() adds to last line', () => {
        const writer = new LineWriter_1.default();
        writer.write('a');
        writer.write(' b');
        writer.writeln(' c');
        writer.write('d');
        writer.writeln();
        writer.writeln('e');
        expect(writer.getResult()).toEqual(`a b c\nd\ne`);
    });
    it('handles indentation', () => {
        const writer = new LineWriter_1.default();
        writer.writeln('function {');
        writer.indent();
        writer.writeln('a = 1');
        writer.unindent();
        writer.writeln('}');
        expect(writer.getResult()).toEqual(`function {\n    a = 1\n}`);
    });
    it('calling writeln multiple times adds blank lines', () => {
        const writer = new LineWriter_1.default();
        writer.writeln();
        writer.writeln();
        writer.writeln();
        writer.writeln('hi');
        expect(writer.getResult()).toEqual('\n\n\nhi');
    });
});

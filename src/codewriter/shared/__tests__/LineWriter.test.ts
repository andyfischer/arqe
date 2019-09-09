
import Writer from '../LineWriter'

describe('Writer', () => {
    it('writes lines', () => {
        const writer = new Writer();
        writer.writeln('line 1');
        writer.writeln('line 2');
        expect(writer.getResult()).toEqual(`line 1\nline 2`);
    });

    it('.write() adds to last line', () => {
        const writer = new Writer();
        writer.write('a');
        writer.write(' b');
        writer.writeln(' c');
        writer.write('d');
        writer.writeln();
        writer.writeln('e');
        expect(writer.getResult()).toEqual(`a b c\nd\ne`);
    });

    it('handles indentation', () => {
        const writer = new Writer();
        writer.writeln('function {');
        writer.indent();
        writer.writeln('a = 1');
        writer.unindent();
        writer.writeln('}');
        expect(writer.getResult()).toEqual(`function {\n    a = 1\n}`);
    });

    it('calling writeln multiple times adds blank lines', () => {
        const writer = new Writer();
        writer.writeln();
        writer.writeln();
        writer.writeln();
        writer.writeln('hi');
        expect(writer.getResult()).toEqual('\n\n\nhi');
    });
});

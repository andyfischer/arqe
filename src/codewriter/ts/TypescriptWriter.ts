
import { LineWriter } from '../shared'
import fs from 'fs-extra'
import { toQuotedString } from '../shared/stringCoerce'

interface Interface {
    name: string
    isExport?: boolean
    isDefaultExport?: boolean
}

interface InterfaceField {
    name: string
    optional?: boolean
    typeDecl: string
}

export default class TypescriptWriter {
    out = new LineWriter()

    async writeToFile(filename: string) {
        await fs.writeFile(filename, `// generated file\n\n` + this.out.getResult());
    }

    lineComment(s: string) {
        this.out.writeln('// ' + s)
    }

    interface_(i: Interface) {
        if (i.isExport)
            this.out.write('export ')
        if (i.isDefaultExport)
            this.out.write('default ')
        this.out.writeln('interface ' + name + ' {')
        this.out.indent()
    }

    interfaceField(f: InterfaceField) {
        this.out.write(f.name)
        if (f.optional)
            this.out.write('?')
        this.out.write(': ' + f.typeDecl)
        this.out.endLine()
    }

    import_(symbols: string, fromPath: string) {
        this.out.write('import ')
        if (symbols) {
            this.out.write(symbols)
            this.out.write(' from ')
        }

        this.out.write(toQuotedString(fromPath))
        this.out.write(';')
        this.out.endLine();
    }

    line(str: string) {
        this.out.writeln(str)
    }

    blankLine() {
        this.out.writeln()
    }

    openBlock(str: string) {
        this.out.writeln(str);
        this.out.indent()
    }

    closeBlock(str: string = "}") {
        this.out.unindent()
        this.out.writeln(str)
    }
}

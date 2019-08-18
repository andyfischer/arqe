
import { LineWriter } from '../shared'

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
        this.out.writeln()
    }

    close() {
        this.out.unindent()
        this.out.writeln('}')
    }
}

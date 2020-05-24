
// js-ast
// js-ast function/*
// js-ast function/* block
// js-ast block/* line/*

import Esprima from 'esprima'
import IDSource from '../utils/IDSource'

// get javascript-ast text(...)

interface JavascriptAst {
}

class JavascriptAstProvider {

    nextInstanceId = new IDSource()
    instances: { [id: string]: JavascriptAst } = {}

    createAstFromText(text: string) {
        const id = nextInstanceId.take();
        const ast = Esprima.parse(text);
        instances[id] = ast;
        return id;
    }

}

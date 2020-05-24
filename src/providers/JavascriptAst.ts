
// js-ast
// js-ast function/*
// js-ast function/* block
// js-ast block/* line/*

import Esprima from 'esprima'
import IDSource from '../utils/IDSource'
import API from './generated/JavascriptAstAPI'

// get javascript-ast text(...)

interface JavascriptAst {
}

class JavascriptAstProvider {

    nextInstanceId = new IDSource()
    instances: { [id: string]: JavascriptAst } = {}

    createAstFromText(text: string) {
        const id = this.nextInstanceId.take();
        const ast = Esprima.parse(text);
        this.instances[id] = ast;
        return id;
    }

}

export default function setup() {
    return new API(new JavascriptAstProvider())
}

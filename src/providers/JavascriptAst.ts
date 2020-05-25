
// js-ast
// js-ast function/*
// js-ast function/* block
// js-ast block/* line/*

import * as Esprima from 'esprima'
import IDSource from '../utils/IDSource'
import API from './generated/JavascriptAstAPI'

// get javascript-ast text(...)

interface JavascriptTree {
    esprimaAst: any
    idsource: IDSource

    byId: { [id: string]: any }
}

function addCrossReferences(tree: JavascriptTree, node: any) {
    node.id = tree.idsource.take();

    tree.byId[node.id] = node;

    if (node.body) {

        let bodyItems = Array.isArray(node.body) ? node.body : [node.body];
        for (const subNode of bodyItems) {
            subNode.parent = node;
            addCrossReferences(tree, subNode);
        }
    }
}

class JavascriptAstProvider {

    nextInstanceId = new IDSource()
    instances: { [id: string]: JavascriptTree } = {}

    createAstFromText(text: string) {

        const id = this.nextInstanceId.take();
        const tree: JavascriptTree = {
            esprimaAst: Esprima.parse(text),
            idsource: new IDSource(),
            byId: {}
        }

        addCrossReferences(tree, tree.esprimaAst);
        this.instances[id] = tree;

        return id;
    }

}

export default function setup() {
    return new API(new JavascriptAstProvider())
}

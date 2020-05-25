
// js-ast
// js-ast function/*
// js-ast function/* block
// js-ast block/* line/*

import * as Esprima from 'esprima'
import IDSource from '../utils/IDSource'
import API from './generated/JavascriptAstAPI'
import { parse, TSESTree } from '@typescript-eslint/typescript-estree'

interface TypescriptTree {
    estree: any
    idsource: IDSource

    byId: { [id: string]: any }
}

function addCrossReferences(tree: TypescriptTree, node: any) {
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
    instances: { [id: string]: TypescriptTree } = {}

    // get javascript-ast text(...)
    createAstFromText(text: string) {

        const id = this.nextInstanceId.take();
        const tree: TypescriptTree = {
            estree: parse(text, {}),
            idsource: new IDSource(),
            byId: {}
        }

        console.log(JSON.stringify(tree.estree, null, 2));

        addCrossReferences(tree, tree.estree);
        this.instances[id] = tree;

        return id;
    }

}

export default function setup() {
    return new API(new JavascriptAstProvider())
}

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import EditModelAPI from './generated/EditModelAPI'
import { GraphLike, startWebApp } from 'ik'
import { setupKeyListener } from './actions'

let graph: GraphLike;
let api: EditModelAPI;

export function getGraph() {
    if (!graph)
        throw new Error('getGraph called too soon');

    return graph;
}

async function main() {
    graph = await startWebApp('dashboard');
    ReactDOM.render(<App />, document.getElementById('root'));
}


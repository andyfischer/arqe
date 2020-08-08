import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import EditModelAPI from './generated/EditModelAPI'
import { GraphLike, startWebApp } from 'fd'
import { setupKeyListener } from './actions'

let graph: GraphLike;
let api: EditModelAPI;

export function getGraph() {
    if (!graph)
        throw new Error('getGraph called too soon');

    return graph;
}

async function main() {
    console.log('startWebApp..');
    graph = await startWebApp('dashboard');
    console.log('finished startWebApp');
    ReactDOM.render(<App />, document.getElementById('root'));
}


main()
.catch(console.error);

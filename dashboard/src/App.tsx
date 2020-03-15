import React, { useState } from 'react';
import { Graph } from 'ik'
import Spreadsheet from './Spreadsheet'
import './App.css';
import useGraphListener from './useGraphListener'

const App: React.FC = () => {

    useGraphListener();

    return (
      <div className="App">
        <Spreadsheet spreadsheetView="spreadsheet-view/1" />
      </div>
    );
}

export default App;

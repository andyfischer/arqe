import React, { useState } from 'react';
import { Graph } from 'ik'
import Spreadsheet from './Spreadsheet'
import './App.css';

const App: React.FC = () => {

    return (
      <div className="App">
        <Spreadsheet spreadsheetView="spreadsheet-view/1" />
      </div>
    );
}

export default App;

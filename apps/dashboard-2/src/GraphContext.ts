import { useContext } from "react";
import React from "react";
import { Graph } from 'arqe'

const graphContext = React.createContext<Graph>(null as any);

export default graphContext;
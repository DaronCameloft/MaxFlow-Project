// src/App.tsx
import { useState, useCallback } from 'react';
import './App.css';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MarkerType,
  addEdge,
} from 'reactflow';
import type { Node, Edge, Connection } from 'reactflow';
import CircleNode from './components/CircleNode';

import { solveMaxFlow } from './apiClient';
import type { GraphInput, SolveResponse } from './types';

const defaultEdgeOptions = {
  type: 'straight', 
  markerEnd: { type: MarkerType.ArrowClosed }, 
};

const nodeTypes = {
  circleNode: CircleNode,
};


const initialNodes: Node[] = [
  { id: 'A', type: 'circleNode', position: { x: 150, y: 50 }, data: { label: 'A', isSource: true } },
  { id: 'B', type: 'circleNode', position: { x: 0, y: 150 }, data: { label: 'B' } },
  { id: 'C', type: 'circleNode', position: { x: 300, y: 150 }, data: { label: 'C' } },
  { id: 'D', type: 'circleNode', position: { x: 150, y: 250 }, data: { label: 'D', isSink: true } },
];



const initialEdges: Edge[] = [
  {
    id: 'eA-B',
    source: 'A',
    target: 'B',
    label: '10',
    markerEnd: { type: MarkerType.ArrowClosed }, 
  },
  {
    id: 'eA-C',
    source: 'A',
    target: 'C',
    label: '5',
    markerEnd: { type: MarkerType.ArrowClosed }, 
  },
  {
    id: 'eB-D',
    source: 'B',
    target: 'D',
    label: '10',
    markerEnd: { type: MarkerType.ArrowClosed }, 
  },
  {
    id: 'eC-D',
    source: 'C',
    target: 'D',
    label: '5',
    markerEnd: { type: MarkerType.ArrowClosed }, 
  },
];

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

 
  const [numNodes, setNumNodes] = useState(8); 
  const [sourceNodeLabel, setSourceNodeLabel] = useState('A'); 
  const [sinkNodeLabel, setSinkNodeLabel] = useState('D');

  
  const [results, setResults] = useState<SolveResponse | null>(null);
  const [nodeLabelMap, setNodeLabelMap] = useState<Map<number, string>>(new Map());
  const [problemStatement, setProblemStatement] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
  const handleSolve = async () => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    const nodeMap = new Map<string, number>();
    nodes.forEach((node, index) => {
      nodeMap.set(node.id, index);
    });

  const reverseMap = new Map<number, string>();
  nodeMap.forEach((index, label) => {
    reverseMap.set(index, label);
  });
  setNodeLabelMap(reverseMap);

   
    const graphEdges = edges.map((edge) => {
      return {
        source: nodeMap.get(edge.source)!,
        target: nodeMap.get(edge.target)!, 
        capacity: Number(edge.label),    
      };
    });

   
    const sourceIndex = nodeMap.get(sourceNodeLabel);
    const sinkIndex = nodeMap.get(sinkNodeLabel);

    if (sourceIndex === undefined || sinkIndex === undefined) {
      setError('No se pudo encontrar el nodo Fuente o Sumidero.');
      setIsLoading(false);
      return;
    }

    
    const inputData: GraphInput = {
      num_nodes: nodes.length,
      edges: graphEdges,
      source_node: sourceIndex,
      sink_node: sinkIndex,
    };
  

    try {
      const response = await solveMaxFlow(inputData);
      setResults(response);
    } catch (err) {
      setError('Error al contactar el backend. ¿Está encendido?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateRandomGraph = () => {
  
    setResults(null);
    setError(null);
    setNodeLabelMap(new Map()); 
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    const N = numNodes; 

   
    const getNodeLabel = (index: number) => String.fromCharCode(65 + index);

 
    const radius = 250;
    const centerX = 200;
    const centerY = 150;

    for (let i = 0; i < N; i++) {
      const angle = (i / (N - 2)) * Math.PI; 
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      const label = getNodeLabel(i);

      let nodeData: any = { label };
      let nodePosition = { x, y };

    
      if (i === 0) {
        nodeData = { label, isSource: true };
        nodePosition = { x: centerX, y: centerY - radius / 2 }; 
        setSourceNodeLabel(label);
      } else if (i === N - 1) { 
        nodeData = { label, isSink: true };
        nodePosition = { x: centerX, y: centerY + radius / 2 }; 
        setSinkNodeLabel(label); 
      }

      newNodes.push({
        id: label,
        type: 'circleNode',
        position: nodePosition,
        data: nodeData,
      });
    }

   
    const intermediateNodeIds = newNodes
      .map(node => node.id)
      .filter(id => id !== getNodeLabel(0) && id !== getNodeLabel(N - 1)); 


    intermediateNodeIds.forEach(nodeId => {
      if (Math.random() > 0.5) { 
        const capacity = Math.floor(Math.random() * 15) + 5; 
        newEdges.push({
          id: `e${getNodeLabel(0)}-${nodeId}`,
          source: getNodeLabel(0),
          target: nodeId,
          label: String(capacity),
          markerEnd: { type: MarkerType.ArrowClosed },
        });
      }
    });

    
    intermediateNodeIds.forEach(nodeId => {
      if (Math.random() > 0.5) { 
        const capacity = Math.floor(Math.random() * 15) + 5;
        newEdges.push({
          id: `e${nodeId}-${getNodeLabel(N - 1)}`,
          source: nodeId,
          target: getNodeLabel(N - 1),
          label: String(capacity),
          markerEnd: { type: MarkerType.ArrowClosed },
        });
      }
    });


    for (let i = 0; i < intermediateNodeIds.length; i++) {
      for (let j = 0; j < intermediateNodeIds.length; j++) {
        if (i !== j && Math.random() > 0.8) { 
          const capacity = Math.floor(Math.random() * 10) + 2; 
          newEdges.push({
            id: `e${intermediateNodeIds[i]}-${intermediateNodeIds[j]}`,
            source: intermediateNodeIds[i],
            target: intermediateNodeIds[j],
            label: String(capacity),
            markerEnd: { type: MarkerType.ArrowClosed },
          });
        }
      }
    }
    
   
    
    setNodes(newNodes);
    setEdges(newEdges);

  const sourceLabel = getNodeLabel(0);
  const sinkLabel = getNodeLabel(N - 1);

  let problemText = `Nodos: ${newNodes.map(n => n.id).join(', ')}\n`;
  problemText += `Fuente: ${sourceLabel}\n`;
  problemText += `Sumidero: ${sinkLabel}\n\n`;
  problemText += 'Aristas con capacidades (u→v ; c):\n';

  newEdges.forEach(edge => {
    problemText += `• ${edge.source} → ${edge.target} ; ${edge.label}\n`;
  });

  setProblemStatement(problemText);
  };


  const handleGenerateControlledGraph = () => {
    setResults(null);
    setError(null);
    setNodeLabelMap(new Map());

    const N = numNodes; 
    if (N < 4) {
      alert("El grafo controlado necesita al menos 4 nodos.");
      return;
    }

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    const getNodeLabel = (index: number) => String.fromCharCode(65 + index);

 
    const sourceId = getNodeLabel(0); 
    const sinkId = getNodeLabel(N - 1); 

    const intermediateCount = N - 2;
    const layer1Count = Math.ceil(intermediateCount / 2); 
    
    const layer1Ids: string[] = [];
    for (let i = 1; i <= layer1Count; i++) {
      layer1Ids.push(getNodeLabel(i));
    }
    
    const layer2Ids: string[] = [];
    for (let i = layer1Count + 1; i < N - 1; i++) {
      layer2Ids.push(getNodeLabel(i));
    }

    const addNode = (id: string, x: number, y: number, isSource = false, isSink = false) => {
      newNodes.push({
        id,
        type: 'circleNode',
        position: { x, y },
        data: { label: id, isSource, isSink },
      });
    };

  
    addNode(sourceId, 50, 200, true, false);
    setSourceNodeLabel(sourceId);


    layer1Ids.forEach((id, index) => {
      addNode(id, 250, (index + 1) * (400 / (layer1Count + 1)));
    });

  
    layer2Ids.forEach((id, index) => {
      addNode(id, 450, (index + 1) * (400 / (layer2Ids.length + 1)));
    });

 
    addNode(sinkId, 650, 200, false, true);
    setSinkNodeLabel(sinkId);

 
    const addEdge = (source: string, target: string) => {
      const capacity = Math.floor(Math.random() * 15) + 5; 
      newEdges.push({
        id: `e${source}-${target}`,
        source,
        target,
        label: String(capacity),
       
      });
    };


    layer1Ids.forEach(id => addEdge(sourceId, id));

 
    layer2Ids.forEach(id => addEdge(id, sinkId));

    if (layer2Ids.length > 0) {
      layer1Ids.forEach(l1Id => {

        const target1 = layer2Ids[Math.floor(Math.random() * layer2Ids.length)];
        addEdge(l1Id, target1);
        
 
        if (Math.random() > 0.5 && layer2Ids.length > 1) {
          const target2 = layer2Ids[Math.floor(Math.random() * layer2Ids.length)];
          if (target1 !== target2) {
            addEdge(l1Id, target2);
          }
        }
      });
    } else {

      layer1Ids.forEach(id => addEdge(id, sinkId));
    }


    
    setNodes(newNodes);
    setEdges(newEdges);
    
  
    let problemText = `Nodos: ${newNodes.map(n => n.id).join(', ')}\n`;
    problemText += `Fuente: ${sourceId}\n`;
    problemText += `Sumidero: ${sinkId}\n\n`;
    problemText += 'Aristas con capacidades (u→v ; c):\n';
    newEdges.forEach(edge => {
      problemText += `• ${edge.source} → ${edge.target} ; ${edge.label}\n`;
    });
    setProblemStatement(problemText);
  };

 
  const onConnect = useCallback(
    (params: Connection) => {
      const capacity = prompt('Ingrese la capacidad para la nueva arista:');
      
      if (capacity && !isNaN(Number(capacity))) {
    
        const newEdge = {
          ...params, 
          label: capacity,
        };
  
        setEdges((eds) => addEdge(newEdge, eds));
      }
    },
    [setEdges]
  );

const onEdgeDoubleClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      const newCapacity = prompt('Ingrese la nueva capacidad:', edge.label as string);

      if (newCapacity && !isNaN(Number(newCapacity))) {
   
        setEdges((eds) =>
          eds.map((e) => {
            if (e.id === edge.id) {
              return { ...e, label: newCapacity };
            }
            return e;
          })
        );
      }
    },
    [setEdges]
  );
  // -------------------------------------------


 
  const handleAddNode = useCallback(() => {
    const newNodeIndex = nodes.length;
    // (Límite simple de A-Z)
    if (newNodeIndex >= 26) {
      alert("Límite de nodos (A-Z) alcanzado.");
      return;
    }
    const newNodeLabel = String.fromCharCode(65 + newNodeIndex);

    const newNode: Node = {
      id: newNodeLabel,
      type: 'circleNode',
     
      position: { x: 100 + (Math.random() * 200), y: 100 }, 
      data: { label: newNodeLabel },
    };
    
    
    setNodes((nds) => [...nds, newNode]);
  }, [nodes, setNodes]); 
  // ------------------------------------------


  return (
    <div className="app-container">
      {/* Columna Izquierda: Configuración */}
      <div className="panel config-panel">
        <h2>Configuración</h2>
    
        <div className="config-group">
          <label htmlFor="numNodes">Número de Nodos: {numNodes}</label>
          <input
            id="numNodes"
            type="range"
            min="8"
            max="16"
            value={numNodes}
            onChange={(e) => setNumNodes(Number(e.target.value))}
            className="slider"
            
          />
        </div>

        <div className="config-group-row">
          <div className="config-group">
            <label htmlFor="sourceNode">Fuente</label>
            <input
              id="sourceNode"
              type="text"
              value={sourceNodeLabel}
              onChange={(e) => setSourceNodeLabel(e.target.value)}
              className="styled-input"
            />
          </div>
          <div className="config-group">
            <label htmlFor="sinkNode">Sumidero</label>
            <input
              id="sinkNode"
              type="text"
              value={sinkNodeLabel}
              onChange={(e) => setSinkNodeLabel(e.target.value)}
              className="styled-input"
            />
          </div>
        </div>

<button
          className="styled-button-secondary"
          onClick={handleGenerateControlledGraph}
          style={{ marginBottom: '0.5rem' }} 
        >
          Generar Grafo Controlado
        </button>
      

        <button
          className="styled-button-secondary"
          onClick={handleGenerateRandomGraph}
        >
          Generar Grafo Aleatorio
        </button>

       
        <button
          className="styled-button-secondary"
          onClick={handleAddNode}
          style={{ marginTop: '0.5rem' }} 
        >
          Añadir Nuevo Nodo
        </button>
      

    
        <button
          className="styled-button-primary"
          onClick={handleSolve}
          disabled={isLoading}
        >
          {isLoading ? 'Calculando...' : 'Resolver Flujo Máximo'}
          </button> 
      
          {problemStatement && (
            <div className="problem-statement">
              <h4>Planteamiento del Grafo:</h4>
              <pre>{problemStatement}</pre>
            </div>
          )}
     

       
      </div>

      {/* Columna Central: Visualización del Grafo */}
      <div className="main-content">
        <h1>MaxFlow Visualizer</h1>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          defaultEdgeOptions={defaultEdgeOptions}
          nodeTypes={nodeTypes}
          onConnect={onConnect}
          onEdgeDoubleClick={onEdgeDoubleClick} 
          fitView
          className="react-flow-canvas"
        >
          <Controls />
          <Background color="#aaa" gap={16} />
        </ReactFlow>
      </div>

      {/* Columna Derecha: Resultados */}
      <div className="panel results-panel">
        <h2>Resultados</h2>
        
        
        {isLoading && <p>Cargando...</p>}
        {error && <p className="error-message">{error}</p>}
        {results && (
          <div className="results-content">
            <h3>Flujo Máximo: {results.max_flow}</h3>
            <h4>Pasos de Aumento:</h4>
          <ul className="steps-list">
              {results.steps.map((step, index) => {
   
          
                const labels = step.path.map(nodeIndex => nodeLabelMap.get(nodeIndex) || '?');

                return (
                  <li key={index}>
                    <strong>Iteración {index + 1}</strong> (Flujo: {step.bottleneck})
                    <div className="etiquetas-list">
                      {labels.map((label, i) => {
                        if (i === 0) return null; 
                        
               
                        const parentLabel = labels[i-1];
                        
                        return (
                          <span key={label} className="etiqueta">
            
                            {label}: [{parentLabel}+, {step.bottleneck}]
                          </span>
                        );
                      })}
                    </div>
                    <small>Total Acumulado: {step.current_total_flow}</small>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
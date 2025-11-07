 
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';  
import React from 'react';

 
interface CircleNodeData {
  label: string;  
  isSource?: boolean;  
  isSink?: boolean;    
}

 
const CircleNode: React.FC<NodeProps<CircleNodeData>> = ({ data, isConnectable }) => {
  const nodeStyle: React.CSSProperties = {
    width: 50,   
    height: 50,  
    borderRadius: '50%',  
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '16px',
    fontWeight: 'bold',
    backgroundColor: '#61dafb',  
    color: '#333',               
    border: '2px solid #222',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
    cursor: 'grab',  
  };

   
  if (data.isSource) {
    nodeStyle.backgroundColor = '#4CAF50';  
    nodeStyle.color = '#fff';
  } else if (data.isSink) {
    nodeStyle.backgroundColor = '#F44336';  
    nodeStyle.color = '#fff';
  }

  return (
    <div style={nodeStyle}>
      {/* Handles son los puntos donde se conectan las aristas */}
      {/* Handle de entrada (arriba) */}
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      
      {/* El texto del nodo */}
      <div>{data.label}</div>

      {/* Handle de salida (abajo) */}
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </div>
  );
};

export default CircleNode;
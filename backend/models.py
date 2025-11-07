# backend/models.py
from pydantic import BaseModel
from typing import List, Dict, Any

class Edge(BaseModel):
    # Una sola arista del grafo
    source: int  # Nodo de origen (usaremos índices numéricos, ej: 0)
    target: int  # Nodo de destino (ej: 1)
    capacity: int # Capacidad de la arista

class GraphInput(BaseModel):
    # La solicitud completa para resolver el grafo
    num_nodes: int
    edges: List[Edge] # Una lista de las aristas que definimos arriba
    source_node: int
    sink_node: int

# --- Modelos para la SALIDA (Lo que responde el Backend) ---

class StepResult(BaseModel):
    # Define cómo se ve UN solo paso del algoritmo
    path: List[int]       # El camino que encontró el BFS (ej: [0, 1, 3])
    bottleneck: int     # El "cuello de botella" de ese camino
    current_total_flow: int # El flujo total acumulado HASTA este paso
    
class MinCutResult(BaseModel):
    # Define el resultado del Corte Mínimo
    S_side: List[int] # Nodos alcanzables desde la Fuente
    T_side: List[int] # Nodos no alcanzables

class SolveResponse(BaseModel):
    # Esta es la respuesta COMPLETA que recibirá el Frontend
    max_flow: int
    steps: List[StepResult]   # Una lista de todos los pasos que ocurrieron
    min_cut: MinCutResult
    
 
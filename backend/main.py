 
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware  

 
from .models import GraphInput, SolveResponse
from .algorithms import ford_fulkerson, bsf, obtener_corte_minimo  

 

app = FastAPI(
    title="MaxFlow API",
    description="API para resolver el problema de Flujo Máximo usando Ford-Fulkerson (Edmonds-Karp)."
)
 
 
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://max-flow-project.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        
    allow_credentials=True,     
    allow_methods=["*"],        
    allow_headers=["*"],        
)


@app.get("/")
def read_root():
    return {"proyecto": "MaxFlow API v1.0"}

@app.post("/api/solve", response_model=SolveResponse)
def solve_max_flow(request: GraphInput):
    """
    Recibe la definición de un grafo y devuelve el flujo máximo
    paso a paso usando Ford-Fulkerson.
    """
    
    try:
        num_nodes = request.num_nodes
        inicio = request.source_node
        fin = request.sink_node
        
         
         
        capacidad_grafo = [[0] * num_nodes for _ in range(num_nodes)]
        
         
        for arista in request.edges:
             
             
             
            capacidad_grafo[arista.source][arista.target] = arista.capacity
            
         
         
         
        
        resultado = ford_fulkerson(capacidad_grafo, inicio, fin)
        
         
         
         
        return resultado

    except Exception as e:
         
        raise HTTPException(status_code=500, detail=str(e))
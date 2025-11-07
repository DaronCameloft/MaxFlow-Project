# backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware # Importamos CORS

# Importamos los modelos (contratos) y el algoritmo (cerebro)
from .models import GraphInput, SolveResponse
from .algorithms import ford_fulkerson, bsf, obtener_corte_minimo # Nombres en español

# --- 1. Configuración de la Aplicación ---

app = FastAPI(
    title="MaxFlow API",
    description="API para resolver el problema de Flujo Máximo usando Ford-Fulkerson (Edmonds-Karp)."
)

# --- 2. Configuración de CORS ---
# Lista de orígenes en los que confiamos.
# Por ahora, solo tu frontend de Vite (normalmente en puerto 5173)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # Permite estos orígenes
    allow_credentials=True,    # Permite cookies (si las usaras)
    allow_methods=["*"],       # Permite todos los métodos (GET, POST, etc.)
    allow_headers=["*"],       # Permite todos los headers
)

# --- 3. Endpoints (Rutas de la API) ---

@app.get("/")
def read_root():
    return {"proyecto": "MaxFlow API v1.0"}

@app.post("/api/solve", response_model=SolveResponse)
def solve_max_flow(request: GraphInput):
    """
    Recibe la definición de un grafo y devuelve el flujo máximo
    paso a paso usando Ford-Fulkerson.
    """
    
    # --- A. Traducción de Datos ---
    # El frontend nos da una LISTA DE ARISTAS (ej: [S, A, 10]).
    # Nuestro algoritmo necesita una MATRIZ DE ADYACENCIA.
    # Tenemos que "traducir" los datos.
    
    try:
        num_nodes = request.num_nodes
        inicio = request.source_node
        fin = request.sink_node
        
        # 1. Crear la matriz de capacidad vacía (llena de ceros)
        # (Una lista de 'num_nodes' listas, cada una con 'num_nodes' ceros)
        capacidad_grafo = [[0] * num_nodes for _ in range(num_nodes)]
        
        # 2. Llenar la matriz con los datos de las aristas
        for arista in request.edges:
            # arista.source es el nodo de origen (ej: 0)
            # arista.target es el nodo de destino (ej: 1)
            # arista.capacity es la capacidad (ej: 15)
            capacidad_grafo[arista.source][arista.target] = arista.capacity
            
        # --- B. Llamar al Algoritmo ---
        # ¡Aquí es donde ocurre la magia!
        # Le pasamos la matriz que acabamos de crear al "cerebro"
        
        resultado = ford_fulkerson(capacidad_grafo, inicio, fin)
        
        # --- C. Devolver la Respuesta ---
        # FastAPI convertirá automáticamente el objeto 'resultado' 
        # en un JSON gracias a Pydantic y 'response_model'.
        return resultado

    except Exception as e:
        # Si algo sale mal (ej: un índice fuera de rango)
        raise HTTPException(status_code=500, detail=str(e))
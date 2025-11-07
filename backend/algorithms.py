from collections import deque # importamos la libreria 'cola' 
from .models import StepResult, MinCutResult, SolveResponse

def bsf(grafo, s, t, parent): # en este caso "bsf" sera el que explore cada nodo
    # grafo es el mapa (matriz)
    # s es el nodo de inicio o fuente
    # t es el nodo sumidero o final
    # parent es una lista vacia que esta funcion llenara

    numero_nodos = len(grafo) # para el tamaño del mapa, o sea, cuantos nodos hay
    visitado = [False] * numero_nodos # marca todos los nodos como NO VISITADOS
    cola = deque() # aqui creamso la cola

    cola.append(s) # aqui decimos que 's' sera el primer lugar a explorar/recorrer
    visitado[s] = True # cuando se explora un nodo, se marca como visitado
    parent[s] = -1 # se coloca el -1 para decir que es el fuente de inicio y que no tiene padre

    # ojito, aqui hacemos toda la exploracion de nodos, este while tiene toda la logica:

    while cola: # while = bucle, es como decir, "mientras la cola de exploracion no este vacia...""
        u = cola.popleft() # usamos popñeft para scar al primer nodo de la cola para explorarlo

    # luego de usar popleft para sacar al primero nodo, debemos explorar todos sus vecinos
    # para ello usamos un for

        for vecino in range(numero_nodos):

        # entonces tenemos lo siguiente:
        # "vecino" es el nodo vecino del que estamos revisando
        # "u" es el nodo actual del que venimos

        # ahora tenemos que chequear 2 condiciones
        # 1. El vecino no ha sido visitado aun
        # 2. hay capacidad en la arista de "u" a "vecino", o sea (grafo[u][vecino] > 0)

            if not visitado[vecino] and grafo[u][vecino] > 0:

                cola.append(vecino) # añadimos al vecino a la cola para visitarlo despues
                visitado[vecino] = True # marcamos al vecino como visitado
                parent[vecino] = u # aqui simulamos el etiquetado que hacemos al resolver los problemas.
                                # decimos: llegamos a "vecino" desde "u"

    return visitado[t] # aqui verificamos dos escenarios
    # si visitado[t] es True, entonces si encontramos un camino
    # si visitado[t] es False, entonces no encontramos un camino

def obtener_corte_minimo(residual_grafo, inicio):

    numero_nodos = len(residual_grafo)
    visitado = [False] * numero_nodos
    cola = deque()

    cola.append(inicio)
    visitado[inicio] = True

    S_side = []

    while cola:
        u = cola.popleft()
        S_side.append(u)

        for vecino in range(numero_nodos):
            if not visitado[vecino] and residual_grafo[u][vecino] > 0:
                visitado[vecino] = True
                cola.append(vecino)

    T_side = []
    for i in range(numero_nodos):
        if not visitado[i]:
            T_side.append(i)
    return MinCutResult(S_side=S_side, T_side=T_side)


def ford_fulkerson(capacidad_grafo, inicio, fin ):

    # aqui, "capacidad_grafo" es el mapa original de capacidades, o sea, cuanto flujo cabe en cada arista
    # inicio y fin seran indices

    numero_nodos = len(capacidad_grafo) # nuevamente, numero_nodos toma el tamaño del grafo, o sea, la cantidad de nodos

    # ok, aqui viene algo importamte, el "Grafo Residual"
    # este grafo es una copia del mapa original que vamos a modificar
    # nos dice la "Capacidad Restante" en cada paso

    residual_grafo = [row[:] for row in capacidad_grafo] # con esto estamos clonando la matriz capacidaa_grafo

    parent = [0] * numero_nodos # esta es la lista que BSF llenara con cada exploracion a algun nodo

    flujo_maximo = 0 # El contador de flujo total empienza en 0

    historial_pasos: list[StepResult] = []
    
    # este es el Bucle Principal, aqui es donde se  junta todo lo antes definido
    # mientras el BSF siga encontrando caminos disponibles...

    while bsf(residual_grafo, inicio, fin, parent):
        # esto es para hallar el cuello de botella
        flujo_ruta = float('inf') # empezamos con un valor infinito
        s = fin # empezamos desde el sumidero

        while s != inicio:

            # aqui miramos la capacidad de la arista que lleva a "s"
            # el padre de "s" es parent[s]

            capacidad_del_paso = residual_grafo[parent[s]][s]
            # comparamos: ¿es esta capacidad mas pequeña que la que teniamos?
            flujo_ruta = min(flujo_ruta, capacidad_del_paso)

            # ahora revisamos la arista anterior
            s = parent[s]

        flujo_maximo += flujo_ruta # sumamos el flujo de este camino a nuestro total

        ruta = []
        vecino = fin
        while vecino != inicio:
            ruta.append(vecino)
            vecino = parent[vecino]

        ruta.append(inicio)
        ruta.reverse()

        paso_actual = StepResult(
            path=ruta,
            bottleneck=flujo_ruta,
            current_total_flow=flujo_maximo
        )
        historial_pasos.append(paso_actual)


            # actualizamos muestro grafo residual

        vecino = fin # empezamos nuevamente en el Sumidero

        while vecino != inicio:

            u = parent[vecino]

            residual_grafo[u][vecino] -= flujo_ruta # rstamos la capacidad que usamos en la direccion hacia adelante

            residual_grafo[vecino][u] += flujo_ruta # sumamos capacidad en la dirección "hacia atrás" (vecino -> u)

            vecino = parent[vecino]

    corte_minimo = obtener_corte_minimo(residual_grafo, inicio)

    # cuando BSF ya no encuentre mas caminos disponibles, el bucle terminara y ya habremos acumulado el dlujo maximo   
    return SolveResponse(
        max_flow=flujo_maximo,
        steps=historial_pasos,
        min_cut=corte_minimo
    )


    
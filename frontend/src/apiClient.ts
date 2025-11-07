// src/apiClient.ts
import axios from 'axios';

// Importamos los "tipos" de datos que definimos en el backend.
// ¡Así TypeScript sabrá de qué estamos hablando!
// Crearemos este archivo de tipos en el siguiente paso.
import type { GraphInput, SolveResponse } from './types';

// Creamos una "instancia" de axios con la URL base de tu backend
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
});

// Creamos la función que llamará nuestro componente de React
export const solveMaxFlow = async (
  graphData: GraphInput
): Promise<SolveResponse> => {
  try {
    // Hacemos la llamada POST a /solve
    const response = await apiClient.post('/solve', graphData);
    // Devolvemos los datos de la respuesta (el JSON)
    return response.data;
  } catch (error) {
    console.error('Error al resolver el flujo máximo:', error);
    // Si hay un error, lo lanzamos para que el componente lo atrape
    throw error;
  }
};
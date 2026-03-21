import axios from 'axios';
import { Inventario } from '../../../api/src/models/Inventario';

const API_URL = '/api/inventarios';


export async function fetchUltimoInventario(): Promise<Inventario | null> {
  try {
    const res = await axios.get(API_URL);
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data[0]; // El más reciente
    }
    return null;
  } catch (e) {
    return null;
  }
}

export async function fetchInventarioPorFecha(fecha: string): Promise<Inventario | null> {
  try {
    const res = await axios.get(API_URL);
    if (Array.isArray(res.data)) {
      // Buscar el inventario más reciente de esa fecha
      const inv = res.data.find((i: Inventario) => i.fecha.startsWith(fecha));
      return inv || null;
    }
    return null;
  } catch (e) {
    return null;
  }
}

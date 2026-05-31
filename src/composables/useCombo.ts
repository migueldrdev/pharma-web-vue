// src/composables/useCombo.ts
// Composable reutilizable para cargar datos de combos (selects) desde la API.

import { Notify } from 'quasar';
import { useFetchHttp, type IHttpResponse } from '@composables/useFetchHttp';
import { resources } from '@api-resources/GeneralApiResource';
import type { IComboItem } from '@interfaces/IComboItem';
import { useComboStore } from '@stores/combos/comboStore';

// Define el tipo para las claves de recursos que son combos
// Esto asegura que solo puedas pasar claves de recursos que tengan un endpoint de combo.
type ComboResourceKey =
  | 'categoriesCombo'
  | 'labsCombo'
  | 'productTypesCombo'
  | 'productPresentationsCombo'
  | 'documentTypesCombo'
  | 'clientsCombo'
  | 'suppliersCombo'
  | 'purchaseDocumentTypesCombo'
  | 'productsCombo'
  | 'storageConditionsCombo'; // Asegúrate de que esta clave exista en resources.ts

export function useCombo() {
  const { fetchHttpResource, loading } = useFetchHttp();
  const comboStore = useComboStore();

  /**
   * Función para cargar datos de un combo específico.
   * @param resourceKey La clave del recurso de combo definida en `resources.ts` (ej. 'categoriesCombo').
   * @returns Una promesa que resuelve con un array de IComboItem[] o lanza un error.
   */
  const loadComboData = async (
    resourceKey: ComboResourceKey,
    saveToStorage: boolean = true,
  ): Promise<IComboItem[]> => {
    // Verifica si la clave de recurso existe en el objeto 'resources'
    if (!resources[resourceKey]) {
      const errorMessage = `Recurso de combo '${resourceKey}' no encontrado en la definición de recursos.`;
      console.error(errorMessage);
      Notify.create({
        type: 'negative',
        message: errorMessage,
      });
      return Promise.reject(new Error(errorMessage));
    }

    // Obtiene las opciones de la API para el recurso dado
    const resourceOption = resources[resourceKey];

    try {
      loading.value = true; // Activa el estado de carga

      // Realiza la petición HTTP usando fetchHttpResource
      // Se espera que la respuesta `data` sea un array de objetos con `label` y `value`.
      const response: IHttpResponse<IComboItem[]> = await fetchHttpResource<IComboItem[]>(
        resourceOption,
        true, // Muestra el spinner de carga
      );

      // Si la petición no fue exitosa, lanza un error
      if (!response.success) {
        const errorMessage =
          response.message || `Error desconocido al cargar el combo '${resourceKey}'.`;
        console.error('Error al cargar datos del combo:', errorMessage);
        Notify.create({
          type: 'negative',
          message: errorMessage,
        });
        return Promise.reject(new Error(errorMessage));
      }

      // Si la petición fue exitosa, retorna los datos del combo
      if (saveToStorage) {
        // Si saveToStorage es verdadero lo guardo en pinia con la misma clave de la resource
        comboStore.setComboData(resourceKey, response.data);
        return []; // o incluso `return response.data` si quieres retornarlo igual
      } else {
        return response.data;
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido al cargar datos del combo.';
      console.error(`Error en loadComboData para '${resourceKey}':`, error);
      Notify.create({
        type: 'negative',
        message: errorMessage,
      });
      return Promise.reject(new Error(errorMessage));
    } finally {
      loading.value = false;
    }
  };

  return {
    loadComboData,
    loading, // Exporta el estado de carga para que los componentes puedan usarlo
  };
}

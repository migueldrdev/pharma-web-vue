<script setup lang="ts">
import type { IComboItem } from '@interfaces/IComboItem';

defineOptions({ name: 'ProductFilters' });

// 1. Props puras (Solo lectura)
defineProps<{
  categoryOptions: IComboItem[];
  labOptions: IComboItem[];
}>();

// 2. Modelos bidireccionales (Generan automáticamente los props y los emits update:xxx)
const search = defineModel<string>('search', { required: true });
const categoryId = defineModel<number | null>('categoryId', { required: true });
const labId = defineModel<number | null>('labId', { required: true });
const stockStatus = defineModel<string | null>('stockStatus', { required: true });

// 3. Eventos personalizados restantes
const emit = defineEmits<{
  changed: [];
}>();

// Opciones estáticas
const stockStatusOptions: IComboItem[] = [
  { label: 'Stock Bajo', value: 'low' },
  { label: 'Sin Stock', value: 'out' },
];

// Función centralizada para notificar cambios tras la actualización del modelo
function onFilterChange() {
  emit('changed');
}
</script>

<template>
  <q-card class="pharma-card q-mb-lg q-pa-sm" flat>
    <q-card-section class="q-pa-md">
      <div class="row q-col-gutter-md items-end">
        <!-- Input: Buscar productos -->
        <div class="col-12 col-sm-6 col-md-4">
          <q-input
            v-model="search"
            @update:model-value="onFilterChange"
            label="Buscar por nombre o código..."
            outlined
            dense
            clearable
            debounce="400"
            class="pharma-input-inset"
          >
            <template #prepend><q-icon name="search" color="primary" /></template>
          </q-input>
        </div>

        <!-- Select: Categoría -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-select
            v-model="categoryId"
            @update:model-value="onFilterChange"
            :options="categoryOptions"
            label="Categoría"
            outlined
            dense
            clearable
            emit-value
            map-options
            class="pharma-input-inset"
          />
        </div>

        <!-- Select: Laboratorio -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-select
            v-model="labId"
            @update:model-value="onFilterChange"
            :options="labOptions"
            label="Laboratorio"
            outlined
            dense
            clearable
            emit-value
            map-options
            class="pharma-input-inset"
          />
        </div>

        <!-- Select: Estado Stock -->
        <div class="col-12 col-sm-6 col-md-2">
          <q-select
            v-model="stockStatus"
            @update:model-value="onFilterChange"
            :options="stockStatusOptions"
            label="Estado Stock"
            outlined
            dense
            clearable
            emit-value
            map-options
            class="pharma-input-inset"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import type { IComboItem } from '@interfaces/IComboItem';

defineOptions({ name: 'ProductFilters' });

const props = defineProps<{
  search: string;
  categoryId: number | null;
  labId: number | null;
  stockStatus: string | null;
  categoryOptions: IComboItem[];
  labOptions: IComboItem[];
}>();

const emit = defineEmits<{
  'update:search': [value: string];
  'update:categoryId': [value: number | null];
  'update:labId': [value: number | null];
  'update:stockStatus': [value: string | null];
  changed: [];
}>();

const stockStatusOptions: IComboItem[] = [
  { label: 'Stock Bajo', value: 'low' },
  { label: 'Sin Stock', value: 'out' },
];
</script>

<template>
  <q-card flat bordered class="q-mb-md">
    <q-card-section class="q-pa-md">
      <div class="row q-gutter-md items-end">
        <div class="col-12 col-sm-6 col-md-3">
          <q-input v-model="props.search" @update:model-value="emit('update:search', ($event as string)); emit('changed')"
            label="Buscar productos" outlined dense clearable debounce="400">
            <template #prepend><q-icon name="search" /></template>
          </q-input>
        </div>
        <div class="col-12 col-sm-6 col-md-2">
          <q-select :model-value="props.categoryId" @update:model-value="emit('update:categoryId', $event); emit('changed')"
            :options="categoryOptions" label="Categoría" outlined dense clearable emit-value map-options />
        </div>
        <div class="col-12 col-sm-6 col-md-2">
          <q-select :model-value="props.labId" @update:model-value="emit('update:labId', $event); emit('changed')"
            :options="labOptions" label="Laboratorio" outlined dense clearable emit-value map-options />
        </div>
        <div class="col-12 col-sm-6 col-md-2">
          <q-select :model-value="props.stockStatus" @update:model-value="emit('update:stockStatus', $event); emit('changed')"
            :options="stockStatusOptions" label="Estado Stock" outlined dense clearable emit-value map-options />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

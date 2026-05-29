<script setup lang="ts" generic="TRow">
import type { QTableProps } from 'quasar';

defineProps<{
  columns: QTableProps['columns'];
  rows: TRow[];
  loading?: boolean;
  filter?: string;
  title?: string;
  visibleColumns?: string[];
}>();

const pagination = defineModel('pagination', {
  type: Object as () => { page: number; rowsPerPage: number; rowsNumber?: number },
  default: () => ({ page: 1, rowsPerPage: 15, rowsNumber: 0 }),
});
</script>

<template>
  <q-table
    :columns="columns"
    :rows="rows"
    :loading="loading"
    :filter="filter"
    :visible-columns="visibleColumns"
    v-model:pagination="pagination"
    row-key="id"
    flat
    bordered
    separator="horizontal"
    class="q-pa-sm bg-white rounded-borders"
    :rows-per-page-options="[10, 15, 25, 50]"
  >
    <template #top>
      <div class="row full-width items-center">
        <span v-if="title" class="text-h6 text-primary">{{ title }}</span>
        <q-space />
        <slot name="top-actions" />
      </div>
    </template>

    <template #body-cell="props">
      <slot name="body-cell" v-bind="props">
        <q-td :props="props" class="q-pa-sm">
          {{ props.value }}
        </q-td>
      </slot>
    </template>

    <template v-if="$slots['item-actions']" #body-cell-actions="props">
      <q-td :props="props" class="q-pa-sm">
        <slot name="item-actions" :row="props.row" />
      </q-td>
    </template>

    <template #no-data>
      <div class="full-width row flex-center text-grey q-py-lg">
        <q-icon name="inbox" size="3em" />
        <span class="q-ml-sm text-body1">Sin datos disponibles</span>
      </div>
    </template>
  </q-table>
</template>

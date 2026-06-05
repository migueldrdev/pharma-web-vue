<script setup lang="ts" generic="TRow extends Record<string, unknown> = Record<string, unknown>">
import { ref, computed } from 'vue'
import type { QTableProps } from 'quasar'
import type {
  AppDataTableColumn,
  AppDataTableFilter,
  AppDataTableAction,
  TableParams,
  TableResponse,
} from './AppDataTable.types'
import { useDialog } from '@/composables/useDialog'
import { useNotify } from '@/composables/useNotify'

const props = withDefaults(
  defineProps<{
    columns: (string | AppDataTableColumn<TRow>)[]
    fetchFunction: (params: TableParams) => Promise<{ success: boolean; data: TableResponse<TRow> }>
    filters?: AppDataTableFilter[]
    actions?: AppDataTableAction<TRow>[]
    selectable?: boolean
    title?: string
    subtitle?: string
    dense?: boolean
    defaultSortBy?: string
    defaultDescending?: boolean
    rowsPerPageOptions?: number[]
    rowKey?: string
  }>(),
  {
    filters: () => [],
    actions: () => [],
    selectable: false,
    dense: false,
    defaultSortBy: 'id',
    defaultDescending: true,
    rowsPerPageOptions: () => [10, 15, 25, 50],
    rowKey: 'id',
  },
)

const emit = defineEmits<{
  'on-select': [selected: TRow[]]
  'on-action': [action: string, row: TRow]
  'on-refresh': []
}>()

const { confirmDelete } = useDialog()
const { success: notifySuccess } = useNotify()

const rows = ref<TRow[]>([])
const loading = ref<boolean>(false)
const selected = ref<readonly TRow[]>([])
const searchFilter = ref<string>('')

const pagination = ref<{
  page: number
  rowsPerPage: number
  sortBy: string
  descending: boolean
  rowsNumber: number
}>({
  page: 1,
  rowsPerPage: props.rowsPerPageOptions![0] ?? 15,
  sortBy: props.defaultSortBy ?? 'id',
  descending: props.defaultDescending ?? true,
  rowsNumber: 0,
})

const qColumns = computed<QTableProps['columns']>(() =>
  props.columns.map((col) => {
    if (typeof col === 'string') {
      return { name: col, label: col, field: col, align: 'left' as const, sortable: true }
    }
    return col as unknown as NonNullable<QTableProps['columns']>[number]
  }),
)

const colNames = computed<string[]>(() =>
  props.columns.map((col) => (typeof col === 'string' ? col : col.name)),
)

function getFieldValue(row: TRow, field: string | ((r: TRow) => unknown)): unknown {
  if (typeof field === 'function') return field(row)
  return row[field]
}

async function onRequest(reqProps: { pagination: QTableProps['pagination']; filter?: string }): Promise<void> {
  loading.value = true
  try {
    const pg = reqProps.pagination ?? { page: 1, rowsPerPage: 15 }
    const page: number = pg.page ?? 1
    const rowsPerPage: number = pg.rowsPerPage ?? 15
    const sortBy: string = String(pg.sortBy ?? pagination.value.sortBy)
    const descending: boolean = Boolean(pg.descending ?? pagination.value.descending)

    const result = await props.fetchFunction({
      pagination: {
        page,
        rowsPerPage: rowsPerPage!,
        sortBy,
        descending,
        rowsNumber: 0,
      },
      filter: searchFilter.value || undefined,
    })

    if (result.success) {
      rows.value = result.data.data as TRow[]
      pagination.value = {
        page,
        rowsPerPage: rowsPerPage!,
        sortBy,
        descending,
        rowsNumber: result.data.total,
      }
    }
  } catch {
    rows.value = []
  } finally {
    loading.value = false
  }
}

function onFilterChange(): void {
  pagination.value.page = 1
  loadData()
}

function refresh(): void {
  emit('on-refresh')
  loadData()
}

function loadData(): void {
  onRequest({ pagination: pagination.value })
}

async function handleAction(action: AppDataTableAction<TRow>, row: TRow): Promise<void> {
  if (action.name === 'delete') {
    const confirmed = await confirmDelete(
      `el registro "${String(getFieldValue(row, 'name') || getFieldValue(row, 'id') || '')}"`,
    )
    if (!confirmed) return
  }
  emit('on-action', action.name, row)
}

function showAction(action: AppDataTableAction<TRow>, row: TRow): boolean {
  return action.condition ? action.condition(row) : true
}

defineExpose({ rows, loading, refresh, loadData, pagination, selected, onFilterChange })
</script>

<template>
  <!-- @vue-ignore -->
  <q-table
    :rows="rows as readonly TRow[]"
    :columns="qColumns"
    :loading="loading"
    :filter="searchFilter"
    :visible-columns="colNames"
    v-model:pagination="pagination"
    v-model:selected="selected"
    :selection="selectable ? 'multiple' : 'none'"
    :row-key="String(rowKey)"
    flat
    bordered
    separator="horizontal"
    :dense="dense"
    :rows-per-page-options="rowsPerPageOptions"
    @request="onRequest"
  >
    <template #top>
      <div class="row full-width items-center q-col-gutter-md">
        <div class="col-auto">
          <span v-if="title" class="text-h6 text-primary">{{ title }}</span>
          <div v-if="subtitle" class="text-caption text-grey">{{ subtitle }}</div>
        </div>
        <slot name="top-left" />
        <q-space />
        <div class="row q-gutter-sm items-center">
          <template v-for="filter in filters" :key="filter.name">
            <q-input
              v-if="filter.type === 'text' || filter.type === 'number'"
              v-model="(filter.model as string | number)"
              :label="filter.label"
              :dense="filter.dense ?? true"
              :type="filter.type"
              :style="filter.style ?? 'width: 180px'"
              :clearable="filter.clearable ?? true"
              debounce="400"
              @update:model-value="onFilterChange"
            />
            <q-select
              v-else-if="filter.type === 'select'"
              v-model="(filter.model as string | number)"
              :label="filter.label"
              :options="filter.options"
              :dense="filter.dense ?? true"
              :style="filter.style ?? 'width: 180px'"
              emit-value
              map-options
              :clearable="filter.clearable ?? true"
              @update:model-value="onFilterChange"
            />
          </template>
          <slot name="top-actions" />
          <q-btn
            v-if="selectable && selected.length"
            :label="`Eliminar (${selected.length})`"
            color="negative"
            icon="delete"
            flat
            rounded
            @click="emit('on-select', [...selected] as TRow[])"
          />
          <q-btn flat round dense icon="refresh" @click="refresh">
            <q-tooltip>Actualizar</q-tooltip>
          </q-btn>
        </div>
      </div>
    </template>

    <template v-for="col in colNames" :key="col" #[`body-cell-${col}`]="slotProps">
      <!-- @vue-ignore -->
      <slot :name="`body-cell-${col}`" v-bind="slotProps">
        <q-td :props="slotProps" class="q-pa-sm">
          {{ slotProps.value }}
        </q-td>
      </slot>
    </template>

    <template v-if="(actions as AppDataTableAction<TRow>[]).length" #body-cell-actions="slotProps">
      <q-td :props="slotProps" class="q-pa-sm">
        <div class="row items-center justify-center q-gutter-xs">
          <template v-for="action in actions" :key="action.name">
            <q-btn
              v-if="showAction(action, slotProps.row)"
              :icon="action.icon"
              :color="action.color ?? 'primary'"
              :flat="action.flat ?? true"
              :round="action.round ?? true"
              :dense="action.dense ?? true"
              size="sm"
              @click="handleAction(action, slotProps.row)"
            >
              <q-tooltip>{{ action.label }}</q-tooltip>
            </q-btn>
          </template>
        </div>
      </q-td>
    </template>

    <template #no-data>
      <div class="full-width row flex-center text-grey q-py-lg">
        <q-icon name="inbox" size="3em" />
        <span class="q-ml-sm text-body1">Sin datos disponibles</span>
      </div>
    </template>

    <template #loading>
      <q-inner-loading showing color="primary" />
    </template>

    <template #bottom>
      <slot name="bottom" />
    </template>
  </q-table>
</template>

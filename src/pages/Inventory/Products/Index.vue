<template>
  <q-page class="page-container">
    <AppPageHeader title="Inventario de Productos" subtitle="Gestión de catálogo, lotes y stock en tiempo real">
      <template #actions>
        <div class="q-gutter-sm row items-center wrap">
          <q-btn v-if="!selectedProducts.length" color="primary" icon="add" :label="$q.screen.gt.xs ? 'Nuevo Producto' : undefined" :dense="$q.screen.lt.sm" @click="openCreate" unelevated class="q-px-md" />
          <q-btn
            v-if="selectedProducts.length"
            color="negative"
            icon="delete"
            :label="`Eliminar (${selectedProducts.length})`"
            @click="confirmDeleteMultiple"
            outline
            class="q-ml-sm"
          />
          <q-btn v-if="!selectedProducts.length" icon="refresh" flat round color="primary" @click="loadProducts" :loading="loading" class="q-ml-sm">
            <q-tooltip>Actualizar catálogo</q-tooltip>
          </q-btn>
          <q-btn
            v-if="!selectedProducts.length"
            icon="psychology"
            flat
            round
            color="accent"
            @click="handleRegenerateAI"
            :loading="regenerating"
            class="q-ml-sm"
          >
            <q-tooltip>Regenerar predicciones de IA</q-tooltip>
          </q-btn>
        </div>
      </template>
    </AppPageHeader>

    <ProductFilters
      v-model:search="filters.search"
      v-model:category-id="filters.category_id"
      v-model:lab-id="filters.lab_id"
      v-model:stock-status="filters.stock_status"
      :category-options="categoryOptions"
      :lab-options="labOptions"
      @changed="onFilterChange"
    />

    <q-card class="pharma-card" flat style="height: calc(100vh - 340px); min-height: 300px">
      <q-table
        :rows="products"
        :columns="columns"
        row-key="id"
        v-model:pagination="pagination"
        :loading="loading"
        :rows-per-page-options="[10, 25, 50, 0]"
        v-model:selected="selectedProducts"
        selection="multiple"
        flat
        class="bg-transparent"
        @request="onTableRequest"
        virtual-scroll
        :virtual-scroll-sticky-size-start="48"
      >
        <template #body-cell-stock="{ value }">
          <q-td>
            <AppStatusBadge :status="getStockStatus(value)" :label="value.toString()" />
          </q-td>
        </template>
        <template #body-cell-price="{ value }">
          <q-td>
            <span class="text-weight-bold text-primary">S/ {{ Number(value).toFixed(2) }}</span>
          </q-td>
        </template>
        <template #body-cell-image="{ row }">
          <q-td>
            <q-avatar
              v-if="row.image"
              size="40px"
              rounded
              class="cursor-pointer shadow-1"
              @click="
                previewImage = row.image;
                showPreview = true;
              "
            >
              <img :src="row.image" :alt="row.name" />
            </q-avatar>
            <q-avatar v-else size="40px" rounded color="grey-2" text-color="grey-5" icon="inventory_2" />
          </q-td>
        </template>
        <template #body-cell-actions="{ row }">
          <q-td class="text-right">
            <q-btn icon="visibility" size="sm" flat round color="info" @click="viewDetail(row)">
              <q-tooltip>Ver Detalles</q-tooltip>
            </q-btn>
            <q-btn icon="edit" size="sm" flat round color="warning" @click="openEdit(row)">
              <q-tooltip>Editar Producto</q-tooltip>
            </q-btn>
            <q-btn icon="delete" size="sm" flat round color="negative" @click="confirmDelete(row)">
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>
        <template #no-data>
          <div class="full-width row flex-center q-pa-xl text-muted">
            <div class="text-center">
              <q-icon name="inventory_2" size="64px" color="grey-4" />
              <div class="text-h6 q-mt-md text-weight-medium">No se encontraron productos</div>
              <p class="text-body2">Ajusta los filtros o agrega un nuevo producto para comenzar.</p>
            </div>
          </div>
        </template>
      </q-table>
    </q-card>

    <ProductForm
      v-model="showDialog"
      :product="currentProduct"
      :is-edit="isEdit"
      @saved="onSaved"
    />

    <AppConfirmDialog
      v-model="showDeleteConfirm"
      title="Eliminar producto"
      :message="deleteMessage"
      confirm-label="Eliminar"
      color="negative"
      @confirm="onDeleteConfirm"
    />

    <q-dialog v-model="showPreview">
      <q-card>
        <q-card-section class="text-center">
          <img :src="previewImage" style="max-height: 400px; max-width: 100%" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import AppPageHeader from '@components/shared/AppPageHeader.vue';
import AppConfirmDialog from '@components/shared/AppConfirmDialog.vue';
import AppStatusBadge from '@components/shared/AppStatusBadge.vue';
import ProductFilters from './components/ProductFilters.vue';
import ProductForm from './components/ProductForm.vue';
import { useProducts } from './composables/useProducts';
import { useCombo } from '@composables/useCombo';
import { useComboStore } from '@stores/combos/comboStore';
import { useFetchHttp } from '@composables/useFetchHttp';
import { useNotify } from '@composables/useNotify';
import { predictionResources } from '@/api-resources/predictionResource';
import type { IProduct } from './interfaces/IProduct';
import type { IComboItem } from '@interfaces/IComboItem';

defineOptions({ name: 'ProductsPage' });

const {
  products,
  loading,
  selectedProducts,
  filters,
  pagination,
  loadProducts,
  deleteProduct,
  deleteMultiple,
} = useProducts();

const { fetchHttpResource } = useFetchHttp();
const { success, error } = useNotify();
const { loadComboData } = useCombo();
const comboStore = useComboStore();
const $q = useQuasar();

const regenerating = ref<boolean>(false);

const categoryOptions = ref<IComboItem[]>(comboStore.getComboData('categoriesCombo'));
const labOptions = ref<IComboItem[]>(comboStore.getComboData('labsCombo'));

const showDialog = ref(false);
const isEdit = ref(false);
const currentProduct = ref<IProduct | null>(null);
const showDeleteConfirm = ref(false);
const deleteTarget = ref<IProduct | null>(null);
const showPreview = ref(false);
const previewImage = ref('');

const columns = [
  { name: 'image', label: '', field: 'image', align: 'center' as const, style: 'width: 50px' },
  { name: 'name', label: 'Producto', field: 'name', align: 'left' as const, sortable: true },
  { name: 'code', label: 'Código', field: 'code', align: 'center' as const, sortable: true },
  { name: 'category_name', label: 'Categoría', field: 'category_name', align: 'left' as const },
  { name: 'lab_name', label: 'Laboratorio', field: 'lab_name', align: 'left' as const },
  { name: 'stock', label: 'Stock', field: 'stock', align: 'center' as const, sortable: true },
  { name: 'price', label: 'Precio', field: 'price', align: 'right' as const, sortable: true },
  {
    name: 'actions',
    label: 'Acciones',
    field: 'actions',
    align: 'center' as const,
    style: 'width: 110px',
  },
];

const deleteMessage = computed(() => `¿Eliminar "${deleteTarget.value?.name ?? ''}"?`);

async function onFilterChange() {
  pagination.value.page = 1;
  await loadProducts();
}

async function handleRegenerateAI(): Promise<void> {
  regenerating.value = true
  try {
    const res = await fetchHttpResource(predictionResources.regenerate)
    if (res.success) {
      success('Predicciones AI regeneradas correctamente')
      await loadProducts()
    }
  } catch {
    error('Error al regenerar predicciones')
  } finally {
    regenerating.value = false
  }
}

async function onTableRequest(props: {
  pagination: { page: number; rowsPerPage: number; sortBy: string; descending: boolean };
}) {
  pagination.value.page = props.pagination.page;
  pagination.value.rowsPerPage = props.pagination.rowsPerPage;
  pagination.value.sortBy = props.pagination.sortBy;
  pagination.value.descending = props.pagination.descending;
  await loadProducts();
}

function openCreate() {
  currentProduct.value = null;
  isEdit.value = false;
  showDialog.value = true;
}
function openEdit(product: IProduct) {
  currentProduct.value = product;
  isEdit.value = true;
  showDialog.value = true;
}
async function onSaved() {
  showDialog.value = false;
  currentProduct.value = null;
  await loadProducts();
}

function confirmDelete(product: IProduct) {
  deleteTarget.value = product;
  showDeleteConfirm.value = true;
}
function confirmDeleteMultiple() {
  deleteTarget.value = null;
  showDeleteConfirm.value = true;
}

async function onDeleteConfirm() {
  if (deleteTarget.value) await deleteProduct(deleteTarget.value.id);
  else await deleteMultiple();
  showDeleteConfirm.value = false;
}

function viewDetail(p: IProduct) {
  previewImage.value = p.image ?? '';
  if (previewImage.value) showPreview.value = true;
}

function getStockStatus(v: number): 'error' | 'warning' | 'active' {
  if (v <= 0) return 'error';
  if (v <= 10) return 'warning';
  return 'active';
}

onMounted(async () => {
  await Promise.all([
    loadComboData('categoriesCombo'),
    loadComboData('labsCombo'),
    loadComboData('productTypesCombo'),
    loadComboData('productPresentationsCombo'),
    loadComboData('storageConditionsCombo'),
  ]);
  categoryOptions.value = comboStore.getComboData('categoriesCombo');
  labOptions.value = comboStore.getComboData('labsCombo');
  await loadProducts();
});
</script>

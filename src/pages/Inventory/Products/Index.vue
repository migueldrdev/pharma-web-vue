<template>
  <q-page class="q-pa-md">
    <AppPageHeader title="Productos" subtitle="Gestión de inventario farmacéutico">
      <template #actions>
        <q-btn color="primary" icon="add" label="Nuevo" @click="openCreate" unelevated />
        <q-btn
          v-if="selectedProducts.length"
          color="negative"
          icon="delete"
          :label="`Eliminar (${selectedProducts.length})`"
          @click="confirmDeleteMultiple"
          outline
        />
        <q-btn icon="refresh" flat round @click="loadProducts" :loading="loading">
          <q-tooltip>Actualizar</q-tooltip>
        </q-btn>
        <q-btn
          icon="psychology"
          flat
          round
          color="purple"
          @click="handleRegenerateAI"
          :loading="regenerating"
        >
          <q-tooltip>Regenerar predicciones AI</q-tooltip>
        </q-btn>
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

    <q-card flat bordered>
      <q-table
        :rows="products"
        :columns="columns"
        row-key="id"
        v-model:pagination="pagination"
        :loading="loading"
        :rows-per-page-options="[10, 25, 50]"
        v-model:selected="selectedProducts"
        selection="multiple"
        flat
        @request="onTableRequest"
      >
        <template #body-cell-stock="{ value }">
          <q-td>
            <q-chip :color="getStockColor(value)" text-color="white" size="sm" dense>
              {{ value }}
            </q-chip>
          </q-td>
        </template>
        <template #body-cell-price="{ value }">
          <q-td>
            <span class="text-weight-medium text-positive">S/ {{ Number(value).toFixed(2) }}</span>
          </q-td>
        </template>
        <template #body-cell-image="{ row }">
          <q-td>
            <q-avatar
              v-if="row.image"
              size="36px"
              rounded
              class="cursor-pointer"
              @click="
                previewImage = row.image;
                showPreview = true;
              "
            >
              <img :src="row.image" :alt="row.name" />
            </q-avatar>
            <q-icon v-else name="image_not_supported" size="20px" color="grey-5" />
          </q-td>
        </template>
        <template #body-cell-actions="{ row }">
          <q-td class="text-center">
            <q-btn icon="visibility" size="sm" flat round color="info" @click="viewDetail(row)">
              <q-tooltip>Ver</q-tooltip>
            </q-btn>
            <q-btn icon="edit" size="sm" flat round color="warning" @click="openEdit(row)">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn icon="delete" size="sm" flat round color="negative" @click="confirmDelete(row)">
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>
        <template #no-data>
          <div class="text-center q-py-lg text-grey-6">
            <q-icon name="inventory_2" size="48px" />
            <div class="text-subtitle1 q-mt-sm">No hay productos disponibles</div>
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
import AppPageHeader from '@components/shared/AppPageHeader.vue';
import AppConfirmDialog from '@components/shared/AppConfirmDialog.vue';
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

function getStockColor(v: number): string {
  if (v <= 0) return 'negative';
  if (v <= 10) return 'warning';
  return 'positive';
}

onMounted(async () => {
  await Promise.all([loadComboData('categoriesCombo'), loadComboData('labsCombo')]);
  categoryOptions.value = comboStore.getComboData('categoriesCombo');
  labOptions.value = comboStore.getComboData('labsCombo');
  await loadProducts();
});
</script>

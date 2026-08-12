<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useNotify } from '@composables/useNotify';
import AppPageHeader from '@components/shared/AppPageHeader.vue';
import AppConfirmDialog from '@components/shared/AppConfirmDialog.vue';
import AppFormDialog from '@components/shared/AppFormDialog.vue';
import AppEmptyState from '@components/shared/AppEmptyState.vue';
import { useValidation } from '@composables/useValidation';
import { useFetchHttp } from '@composables/useFetchHttp';
import { resources } from '@api-resources/GeneralApiResource';

defineOptions({ name: 'CategoriesPage' });

interface Category {
  id: number;
  name: string;
}
const { fetchHttpResource } = useFetchHttp();
const { success, error } = useNotify();
const { required } = useValidation();
const items = ref<Category[]>([]);
const loading = ref(false);
const filter = ref('');
const showDialog = ref(false);
const editing = ref(false);
const current = ref<Category | null>(null);
const formName = ref('');
const showDelete = ref(false);
const deleting = ref<Category | null>(null);
const submitting = ref(false);

const columns = [
  { name: 'id', label: '#', field: 'id', align: 'left' as const },
  { name: 'name', label: 'Nombre', field: 'name', align: 'left' as const },
  { name: 'actions', label: '', field: 'actions', align: 'right' as const, style: 'width: 100px' },
];

async function load() {
  loading.value = true;
  try {
    const params: Record<string, unknown> = { page: 1, per_page: 50 };
    if (filter.value) params.search = filter.value;
    const res = await fetchHttpResource<Category[] | { data: Category[] }>({ ...resources.allCategories, params }, false);
    const rawData = res.data;
    items.value = Array.isArray(rawData) ? rawData : (rawData as { data?: Category[] })?.data ?? [];
  } catch {
    error('Error al cargar');
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editing.value = false;
  formName.value = '';
  showDialog.value = true;
}
function openEdit(c: Category) {
  editing.value = true;
  current.value = c;
  formName.value = c.name;
  showDialog.value = true;
}

async function save() {
  submitting.value = true;
  try {
    if (editing.value && current.value) {
      await fetchHttpResource({
        ...resources.updateCategory,
        paramsRoute: [String(current.value.id)],
        data: { name: formName.value },
      });
      success('Categoría actualizada');
    } else {
      await fetchHttpResource({ ...resources.createCategory, data: { name: formName.value } });
      success('Categoría creada');
    }
    showDialog.value = false;
    await load();
  } catch {
    error('Error al guardar');
  } finally {
    submitting.value = false;
  }
}

function confirmDelete(c: Category) {
  deleting.value = c;
  showDelete.value = true;
}
async function onDelete() {
  if (!deleting.value) return;
  try {
    await fetchHttpResource({
      ...resources.deleteCategory,
      paramsRoute: [String(deleting.value.id)],
    });
    success('Eliminada');
    await load();
  } catch {
    error('Error al eliminar');
  } finally {
    showDelete.value = false;
  }
}

const deleteMsg = computed(() => `¿Eliminar "${deleting.value?.name ?? ''}"?`);

onMounted(() => load());
</script>

<template>
  <q-page class="q-pa-md">
    <AppPageHeader title="Categorías" subtitle="Clasificación de productos farmacéuticos">
      <template #actions>
        <q-btn color="primary" class="pharma-btn-main" icon="add" label="Nueva Categoría" unelevated @click="openCreate" />
        <q-btn icon="refresh" flat round @click="load()" :loading="loading" class="q-ml-sm" />
      </template>
    </AppPageHeader>

    <q-card flat bordered class="pharma-card q-mt-md">
      <q-card-section class="q-pb-none">
        <q-input
          v-model="filter"
          label="Buscar por nombre..."
          outlined
          dense
          clearable
          debounce="400"
          class="pharma-input-inset"
          @update:model-value="load()"
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>
      </q-card-section>
      
      <q-card-section>
        <q-table 
          :rows="items" 
          :columns="columns" 
          row-key="id" 
          :loading="loading" 
          flat 
          class="bg-transparent"
        >
          <template #body-cell-id="props">
            <q-td :props="props">
              <span class="text-weight-medium text-grey-8">#{{ props.value }}</span>
            </q-td>
          </template>
          
          <template #body-cell-name="props">
            <q-td :props="props">
              <div class="row items-center no-wrap">
                <q-icon name="category" size="xs" color="primary" class="q-mr-sm" />
                <span class="text-weight-bold">{{ props.value }}</span>
              </div>
            </q-td>
          </template>

          <template #body-cell-actions="{ row }">
            <q-td class="text-right">
              <q-btn icon="edit" size="sm" flat round color="secondary" @click="openEdit(row)">
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn icon="delete" size="sm" flat round color="negative" @click="confirmDelete(row)">
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </q-td>
          </template>
          
          <template #no-data>
            <div class="full-width row flex-center q-pa-md">
              <AppEmptyState
                icon="category"
                title="Sin categorías"
                :description="filter ? 'No se encontraron categorías que coincidan con la búsqueda.' : 'No hay categorías registradas en el sistema.'"
              />
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <AppFormDialog
      v-model="showDialog"
      :title="editing ? 'Editar Categoría' : 'Nueva Categoría'"
      :loading="submitting"
      @submit="save"
    >
      <div class="q-gutter-md">
        <q-input
          v-model="formName"
          label="Nombre de categoría *"
          outlined
          dense
          class="pharma-input-inset"
          :rules="[required('Nombre')]"
        >
          <template #prepend><q-icon name="label" /></template>
        </q-input>
      </div>
    </AppFormDialog>

    <AppConfirmDialog
      v-model="showDelete"
      title="Eliminar categoría"
      :message="deleteMsg"
      confirm-label="Eliminar"
      color="negative"
      @confirm="onDelete"
    />
  </q-page>
</template>

<style lang="scss" scoped>
.pharma-card {
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px;
}
.pharma-btn-main {
  font-weight: 600;
  border-radius: 8px;
  padding: 0 16px;
}
.pharma-input-inset {
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
}
</style>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Notify } from 'quasar';
import AppPageHeader from '@components/shared/AppPageHeader.vue';
import AppConfirmDialog from '@components/shared/AppConfirmDialog.vue';
import { useFetchHttp } from '@composables/useFetchHttp';
import { resources } from '@api-resources/GeneralApiResource';

defineOptions({ name: 'CategoriesPage' });

interface Category { id: number; name: string; }
const { fetchHttpResource } = useFetchHttp();
const items = ref<Category[]>([]);
const loading = ref(false);
const filter = ref('');
const showDialog = ref(false);
const editing = ref(false);
const current = ref<Category | null>(null);
const formName = ref('');
const showDelete = ref(false);
const deleting = ref<Category | null>(null);

const columns = [
  { name: 'id', label: '#', field: 'id', align: 'left' as const },
  { name: 'name', label: 'Nombre', field: 'name', align: 'left' as const },
  { name: 'actions', label: '', field: 'actions', align: 'center' as const, style: 'width: 80px' },
];

async function load() {
  loading.value = true;
  try {
    const params: Record<string, unknown> = { page: 1, per_page: 50 };
    if (filter.value) params.search = filter.value;
    const res = await fetchHttpResource<Category[]>({ ...resources.allCategories, params }, false);
    const payload = res.data as unknown as { data?: Category[] };
    items.value = payload?.data ?? (Array.isArray(res.data) ? res.data as Category[] : []);
  } catch { Notify.create({ type: 'negative', message: 'Error al cargar' }); }
  finally { loading.value = false; }
}

function openCreate() { editing.value = false; formName.value = ''; showDialog.value = true; }
function openEdit(c: Category) { editing.value = true; current.value = c; formName.value = c.name; showDialog.value = true; }

async function save() {
  try {
    if (editing.value && current.value) {
      await fetchHttpResource({ ...resources.updateCategory, paramsRoute: [String(current.value.id)], data: { name: formName.value } });
      Notify.create({ type: 'positive', message: 'Categoría actualizada' });
    } else {
      await fetchHttpResource({ ...resources.createCategory, data: { name: formName.value } });
      Notify.create({ type: 'positive', message: 'Categoría creada' });
    }
    showDialog.value = false; load();
  } catch { Notify.create({ type: 'negative', message: 'Error al guardar' }); }
}

function confirmDelete(c: Category) { deleting.value = c; showDelete.value = true; }
async function onDelete() {
  if (!deleting.value) return;
  try { await fetchHttpResource({ ...resources.deleteCategory, paramsRoute: [String(deleting.value.id)] }); Notify.create({ type: 'positive', message: 'Eliminada' }); load(); }
  catch { Notify.create({ type: 'negative', message: 'Error al eliminar' }); }
  finally { showDelete.value = false; }
}

const deleteMsg = computed(() => `¿Eliminar "${deleting.value?.name ?? ''}"?`);

onMounted(() => load());
</script>

<template>
  <q-page class="q-pa-md">
    <AppPageHeader title="Categorías" subtitle="Clasificación de productos">
      <template #actions>
        <q-btn color="primary" icon="add" label="Nueva" unelevated @click="openCreate" />
        <q-btn icon="refresh" flat round @click="load()" :loading="loading" />
      </template>
    </AppPageHeader>
    <q-card flat bordered>
      <q-card-section>
        <q-input v-model="filter" label="Buscar" outlined dense clearable debounce="400" @update:model-value="load()">
          <template #prepend><q-icon name="search" /></template>
        </q-input>
      </q-card-section>
      <q-table :rows="items" :columns="columns" row-key="id" :loading="loading" flat>
        <template #body-cell-actions="{ row }">
          <q-td class="text-center">
            <q-btn icon="edit" size="sm" flat round color="warning" @click="openEdit(row)" />
            <q-btn icon="delete" size="sm" flat round color="negative" @click="confirmDelete(row)" />
          </q-td>
        </template>
      </q-table>
    </q-card>
    <q-dialog v-model="showDialog">
      <q-card style="width: 400px; max-width: 90vw">
        <q-bar class="bg-primary text-white"><div>{{ editing ? 'Editar' : 'Nueva' }} Categoría</div><q-space /><q-btn dense flat icon="close" v-close-popup /></q-bar>
        <q-card-section>
          <q-input v-model="formName" label="Nombre *" outlined dense :rules="[(v: string) => !!v || 'Requerido']" />
        </q-card-section>
        <q-card-actions align="right"><q-btn flat label="Cancelar" v-close-popup /><q-btn color="primary" label="Guardar" @click="save" /></q-card-actions>
      </q-card>
    </q-dialog>
    <AppConfirmDialog v-model="showDelete" title="Eliminar categoría" :message="deleteMsg" confirm-label="Eliminar" color="negative" @confirm="onDelete" />
  </q-page>
</template>

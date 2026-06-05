<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useNotify } from '@composables/useNotify';
import AppPageHeader from '@components/shared/AppPageHeader.vue';
import AppConfirmDialog from '@components/shared/AppConfirmDialog.vue';
import { useFetchHttp } from '@composables/useFetchHttp';
import { supplierResources } from '../api-resource/purchaseResource';
import type { ISupplier } from '../interfaces/IPurchase';

defineOptions({ name: 'SuppliersPage' });

const { fetchHttpResource } = useFetchHttp();
const { success, error } = useNotify();
const items = ref<ISupplier[]>([]);
const loading = ref(false);
const filter = ref('');
const showDialog = ref(false);
const showDelete = ref(false);
const editing = ref(false);
const current = ref<ISupplier | null>(null);
const form = ref({ name: '', email: '', phone: '', address: '' });
const deleting = ref<ISupplier | null>(null);

const columns = [
  { name: 'id', label: '#', field: 'id', align: 'left' as const },
  { name: 'name', label: 'Nombre', field: 'name', align: 'left' as const },
  { name: 'email', label: 'Email', field: 'email', align: 'left' as const },
  { name: 'phone', label: 'Teléfono', field: 'phone', align: 'left' as const },
  { name: 'actions', label: '', field: 'actions', align: 'center' as const, style: 'width: 80px' },
];

async function load() {
  loading.value = true;
  try {
    const params: Record<string, unknown> = { page: 1, per_page: 50 };
    if (filter.value) params.search = filter.value;
    const res = await fetchHttpResource<ISupplier[]>(supplierResources.list(params), false);
    const payload = res.data as unknown as { data?: ISupplier[] };
    items.value = payload?.data ?? (Array.isArray(res.data) ? res.data : []);
  } catch {
    error('Error al cargar');
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editing.value = false;
  form.value = { name: '', email: '', phone: '', address: '' };
  showDialog.value = true;
}
function openEdit(s: ISupplier) {
  editing.value = true;
  current.value = s;
  form.value = { name: s.name, email: s.email, phone: s.phone ?? '', address: s.address ?? '' };
  showDialog.value = true;
}

async function save() {
  try {
    if (editing.value && current.value) {
      await fetchHttpResource({
        ...supplierResources.update(current.value.id),
        data: form.value as unknown as Record<string, unknown>,
      });
      success('Proveedor actualizado');
    } else {
      await fetchHttpResource({
        ...supplierResources.create,
        data: form.value as unknown as Record<string, unknown>,
      });
      success('Proveedor creado');
    }
    showDialog.value = false;
    await load();
  } catch {
    error('Error al guardar');
  }
}

function confirmDelete(s: ISupplier) {
  deleting.value = s;
  showDelete.value = true;
}
async function onDelete() {
  if (!deleting.value) return;
  try {
    await fetchHttpResource(supplierResources.delete(deleting.value.id));
    success('Eliminado');
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
    <AppPageHeader title="Proveedores" subtitle="Gestión de proveedores">
      <template #actions>
        <q-btn color="primary" icon="add" label="Nuevo" unelevated @click="openCreate" />
        <q-btn icon="refresh" flat round @click="load()" :loading="loading" />
      </template>
    </AppPageHeader>
    <q-card flat bordered>
      <q-card-section>
        <q-input
          v-model="filter"
          label="Buscar"
          outlined
          dense
          clearable
          debounce="400"
          @update:model-value="load()"
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>
      </q-card-section>
      <q-table :rows="items" :columns="columns" row-key="id" :loading="loading" flat>
        <template #body-cell-actions="{ row }">
          <q-td class="text-center">
            <q-btn icon="edit" size="sm" flat round color="warning" @click="openEdit(row)" />
            <q-btn
              icon="delete"
              size="sm"
              flat
              round
              color="negative"
              @click="confirmDelete(row)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="showDialog">
      <q-card style="width: 500px; max-width: 90vw">
        <q-bar class="bg-primary text-white"
          ><div>{{ editing ? 'Editar' : 'Nuevo' }} Proveedor</div>
          <q-space /><q-btn dense flat icon="close" v-close-popup
        /></q-bar>
        <q-card-section>
          <q-input
            v-model="form.name"
            label="Nombre *"
            outlined
            dense
            :rules="[(v: string) => !!v || 'Requerido']"
            class="q-mb-sm"
          />
          <q-input v-model="form.email" label="Email" outlined dense class="q-mb-sm" />
          <q-input v-model="form.phone" label="Teléfono" outlined dense class="q-mb-sm" />
          <q-input v-model="form.address" label="Dirección" outlined dense />
        </q-card-section>
        <q-card-actions align="right"
          ><q-btn flat label="Cancelar" v-close-popup /><q-btn
            color="primary"
            label="Guardar"
            @click="save"
        /></q-card-actions>
      </q-card>
    </q-dialog>

    <AppConfirmDialog
      v-model="showDelete"
      title="Eliminar proveedor"
      :message="deleteMsg"
      confirm-label="Eliminar"
      color="negative"
      @confirm="onDelete"
    />
  </q-page>
</template>

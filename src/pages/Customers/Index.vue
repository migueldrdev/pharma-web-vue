<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Notify } from 'quasar';
import AppPageHeader from '@components/shared/AppPageHeader.vue';
import AppConfirmDialog from '@components/shared/AppConfirmDialog.vue';
import { useFetchHttp } from '@composables/useFetchHttp';
import { resources } from '@api-resources/GeneralApiResource';

defineOptions({ name: 'CustomersPage' });

interface Customer { id: number; name: string; email: string; phone: string; address?: string; document_number?: string; }
const { fetchHttpResource } = useFetchHttp();
const items = ref<Customer[]>([]);
const loading = ref(false);
const filter = ref('');
const showDialog = ref(false);
const editing = ref(false);
const current = ref<Customer | null>(null);
const form = ref({ name: '', email: '', phone: '', address: '', document_number: '' });
const showDelete = ref(false);
const deleting = ref<Customer | null>(null);

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
    const res = await fetchHttpResource<Customer[]>({ ...resources.allClients, params }, false);
    const payload = res.data as unknown as { data?: Customer[] };
    items.value = payload?.data ?? (Array.isArray(res.data) ? res.data as Customer[] : []);
  } catch { Notify.create({ type: 'negative', message: 'Error al cargar' }); }
  finally { loading.value = false; }
}

function openCreate() { editing.value = false; form.value = { name: '', email: '', phone: '', address: '', document_number: '' }; showDialog.value = true; }
function openEdit(c: Customer) { editing.value = true; current.value = c; form.value = { name: c.name, email: c.email, phone: c.phone ?? '', address: c.address ?? '', document_number: c.document_number ?? '' }; showDialog.value = true; }

async function save() {
  try {
    const data = form.value as unknown as Record<string, unknown>;
    if (editing.value && current.value) {
      await fetchHttpResource({ ...resources.updateClient, paramsRoute: [String(current.value.id)], data });
      Notify.create({ type: 'positive', message: 'Cliente actualizado' });
    } else {
      await fetchHttpResource({ ...resources.createClient, data });
      Notify.create({ type: 'positive', message: 'Cliente creado' });
    }
    showDialog.value = false; load();
  } catch { Notify.create({ type: 'negative', message: 'Error al guardar' }); }
}

function confirmDelete(c: Customer) { deleting.value = c; showDelete.value = true; }
async function onDelete() {
  if (!deleting.value) return;
  try { await fetchHttpResource({ ...resources.deleteClient, paramsRoute: [String(deleting.value.id)] }); Notify.create({ type: 'positive', message: 'Eliminado' }); load(); }
  catch { Notify.create({ type: 'negative', message: 'Error al eliminar' }); }
  finally { showDelete.value = false; }
}

const deleteMsg = computed(() => `¿Eliminar "${deleting.value?.name ?? ''}"?`);

onMounted(() => load());
</script>

<template>
  <q-page class="q-pa-md">
    <AppPageHeader title="Clientes" subtitle="Gestión de clientes">
      <template #actions>
        <q-btn color="primary" icon="add" label="Nuevo" unelevated @click="openCreate" />
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
      <q-card style="width: 500px; max-width: 90vw">
        <q-bar class="bg-primary text-white"><div>{{ editing ? 'Editar' : 'Nuevo' }} Cliente</div><q-space /><q-btn dense flat icon="close" v-close-popup /></q-bar>
        <q-card-section>
          <q-input v-model="form.name" label="Nombre *" outlined dense :rules="[(v: string) => !!v || 'Requerido']" class="q-mb-sm" />
          <q-input v-model="form.email" label="Email" outlined dense class="q-mb-sm" />
          <q-input v-model="form.phone" label="Teléfono" outlined dense class="q-mb-sm" />
          <q-input v-model="form.document_number" label="N° Documento" outlined dense class="q-mb-sm" />
          <q-input v-model="form.address" label="Dirección" outlined dense />
        </q-card-section>
        <q-card-actions align="right"><q-btn flat label="Cancelar" v-close-popup /><q-btn color="primary" label="Guardar" @click="save" /></q-card-actions>
      </q-card>
    </q-dialog>
    <AppConfirmDialog v-model="showDelete" title="Eliminar cliente" :message="deleteMsg" confirm-label="Eliminar" color="negative" @confirm="onDelete" />
  </q-page>
</template>

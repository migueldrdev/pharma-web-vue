<template>
  <q-page class="q-pa-md">
    <AppPageHeader title="Proveedores" subtitle="Gestión de proveedores">
      <template #actions>
        <q-btn color="primary" icon="add" label="Nuevo" @click="openCreate" unelevated />
        <q-btn icon="refresh" @click="load" flat round color="grey"><q-tooltip>Actualizar</q-tooltip></q-btn>
      </template>
    </AppPageHeader>

    <q-card flat bordered>
      <q-card-section>
        <q-input v-model="filter" label="Buscar" outlined dense clearable debounce="300" class="q-mb-md"><template #prepend><q-icon name="search" /></template></q-input>
        <q-table :rows="items" :columns="columns" :loading="loading" :filter="filter" row-key="id" flat dense :rows-per-page-options="[10, 20, 50]">
          <template #body-cell-actions="props">
            <q-td :props="props">
              <q-btn icon="edit" size="sm" flat round color="warning" @click="openEdit(props.row)"><q-tooltip>Editar</q-tooltip></q-btn>
              <q-btn icon="delete" size="sm" flat round color="negative" @click="showDelete = true; deleteTarget = props.row"><q-tooltip>Eliminar</q-tooltip></q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="showForm" :maximized="$q.screen.lt.md">
      <q-card style="width: 500px; max-width: 95vw">
        <q-bar class="bg-primary text-white"><div>{{ isEdit ? 'Editar' : 'Nuevo' }} Proveedor</div><q-space /><q-btn dense flat icon="close" v-close-popup /></q-bar>
        <q-card-section>
          <q-input v-model="form.name" label="Nombre *" outlined dense class="q-mb-sm" />
          <q-input v-model="form.email" label="Email" outlined dense class="q-mb-sm" />
          <q-input v-model="form.phone" label="Teléfono" outlined dense class="q-mb-sm" />
          <q-input v-model="form.address" label="Dirección" outlined dense class="q-mb-sm" />
        </q-card-section>
        <q-card-actions align="right"><q-btn flat label="Cancelar" v-close-popup /><q-btn unelevated color="primary" label="Guardar" @click="save" :loading="saving" /></q-card-actions>
      </q-card>
    </q-dialog>

    <AppConfirmDialog v-model="showDelete" title="Eliminar proveedor" :message="`¿Eliminar \"${deleteTarget?.name}\"?`" confirm-label="Eliminar" color="negative" @confirm="handleDelete" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import AppPageHeader from '@components/shared/AppPageHeader.vue';
import AppConfirmDialog from '@components/shared/AppConfirmDialog.vue';
import { useFetchHttp, IHttpResourceOption } from '@composables/useFetchHttp';

interface Supplier { id: number; name: string; email: string; phone: string; address: string; }

const { fetchHttpResource } = useFetchHttp();
const $q = useQuasar();
const items = ref<Supplier[]>([]);
const loading = ref(false);
const filter = ref('');
const showForm = ref(false);
const showDelete = ref(false);
const isEdit = ref(false);
const saving = ref(false);
const deleteTarget = ref<Supplier | null>(null);
const form = ref({ id: null as number | null, name: '', email: '', phone: '', address: '' });

const columns = [
  { name: 'id', label: '#', field: 'id', align: 'left' as const },
  { name: 'name', label: 'Nombre', field: 'name', align: 'left' as const },
  { name: 'email', label: 'Email', field: 'email', align: 'left' as const },
  { name: 'phone', label: 'Teléfono', field: 'phone', align: 'left' as const },
  { name: 'actions', label: '', field: 'id', align: 'center' as const },
];

const apiPath = '/supplier';

async function load() {
  loading.value = true;
  try { const r = await fetchHttpResource<{ data: Supplier[] }>({ path: apiPath, method: 0 as unknown as 'get' } as IHttpResourceOption); items.value = Array.isArray(r.data) ? r.data as Supplier[] : (r.data as any)?.data || []; }
  catch { $q.notify({ type: 'negative', message: 'Error al cargar' }); }
  finally { loading.value = false; }
}

function openCreate() { form.value = { id: null, name: '', email: '', phone: '', address: '' }; isEdit.value = false; showForm.value = true; }
function openEdit(row: Supplier) { form.value = { ...row }; isEdit.value = true; showForm.value = true; }

async function save() {
  if (!form.value.name) { $q.notify({ type: 'warning', message: 'Nombre requerido' }); return; }
  saving.value = true;
  try {
    const r = await fetchHttpResource({
      path: apiPath + (isEdit.value ? `/${form.value.id}` : ''),
      method: isEdit.value ? 'put' as unknown as 'put' : 'post' as unknown as 'post',
      data: form.value as unknown as Record<string, unknown>,
    } as IHttpResourceOption);
    if (r.success) { $q.notify({ type: 'positive', message: isEdit.value ? 'Actualizado' : 'Creado' }); showForm.value = false; load(); }
    else { $q.notify({ type: 'negative', message: r.message || 'Error' }); }
  } catch { $q.notify({ type: 'negative', message: 'Error al guardar' }); }
  finally { saving.value = false; }
}

async function handleDelete() {
  if (!deleteTarget.value) return;
  try {
    const r = await fetchHttpResource({ path: `${apiPath}/${deleteTarget.value.id}`, method: 'delete' as unknown as 'delete' } as IHttpResourceOption);
    if (r.success) { $q.notify({ type: 'positive', message: 'Eliminado' }); load(); }
    else { $q.notify({ type: 'negative', message: r.message || 'Error' }); }
  } catch { $q.notify({ type: 'negative', message: 'Error' }); }
}

onMounted(() => { void load(); });
</script>

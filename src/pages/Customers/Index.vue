<template>
  <q-page class="q-pa-md">
    <AppPageHeader title="Clientes" subtitle="Gestión de clientes registrados">
      <template #actions><q-btn color="primary" icon="add" label="Nuevo" @click="openCreate" unelevated /><q-btn icon="refresh" @click="load" flat round color="grey"><q-tooltip>Actualizar</q-tooltip></q-btn></template>
    </AppPageHeader>
    <q-card flat bordered>
      <q-card-section>
        <q-input v-model="filter" label="Buscar" outlined dense clearable debounce="300" class="q-mb-md"><template #prepend><q-icon name="search" /></template></q-input>
        <q-table :rows="items" :columns="columns" :loading="loading" :filter="filter" row-key="id" flat dense :rows-per-page-options="[10, 20, 50]">
          <template #body-cell-actions="props"><q-td :props="props"><q-btn icon="edit" size="sm" flat round color="warning" @click="openEdit(props.row)" /><q-btn icon="delete" size="sm" flat round color="negative" @click="showDelete=true;deleteTarget=props.row" /></q-td></template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="showForm" :maximized="$q.screen.lt.md"><q-card style="width:500px;max-width:95vw"><q-bar class="bg-primary text-white"><div>{{isEdit?'Editar':'Nuevo'}} Cliente</div><q-space/><q-btn dense flat icon="close" v-close-popup/></q-bar>
      <q-card-section>
        <q-input v-model="form.name" label="Nombre *" outlined dense class="q-mb-sm" />
        <q-input v-model="form.email" label="Email" outlined dense class="q-mb-sm" />
        <q-input v-model="form.phone" label="Teléfono" outlined dense class="q-mb-sm" />
        <q-input v-model="form.address" label="Dirección" outlined dense class="q-mb-sm" />
        <q-input v-model="form.document_number" label="N° Documento" outlined dense class="q-mb-sm" />
      </q-card-section>
      <q-card-actions align="right"><q-btn flat label="Cancelar" v-close-popup/><q-btn unelevated color="primary" label="Guardar" @click="save" :loading="saving"/></q-card-actions></q-card>
    </q-dialog>
    <AppConfirmDialog v-model="showDelete" title="Eliminar cliente" :message="`¿Eliminar \"${deleteTarget?.name}\"?`" color="negative" confirm-label="Eliminar" @confirm="handleDelete"/>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import AppPageHeader from '@components/shared/AppPageHeader.vue';
import AppConfirmDialog from '@components/shared/AppConfirmDialog.vue';
import { useFetchHttp } from '@composables/useFetchHttp';

interface Item { id: number; name: string; email: string; phone: string; address: string; document_number: string; }
const { fetchHttpResource } = useFetchHttp();
const $q = useQuasar();
const items = ref<Item[]>([]); const loading = ref(false); const filter = ref('');
const showForm = ref(false); const showDelete = ref(false); const isEdit = ref(false); const saving = ref(false);
const deleteTarget = ref<Item | null>(null);
const form = ref({ id: null as number | null, name: '', email: '', phone: '', address: '', document_number: '' });
const columns = [
  { name: 'id', label: '#', field: 'id', align: 'left' as const }, { name: 'name', label: 'Nombre', field: 'name', align: 'left' as const },
  { name: 'email', label: 'Email', field: 'email', align: 'left' as const }, { name: 'phone', label: 'Teléfono', field: 'phone', align: 'left' as const },
  { name: 'actions', label: '', field: 'id', align: 'center' as const },
];

async function load() { loading.value = true; try { const r = await fetchHttpResource({ path: '/client', method: 'get' as never }); items.value = Array.isArray(r.data) ? r.data as Item[] : (r.data as any)?.data || []; } catch { $q.notify({ type: 'negative', message: 'Error' }); } finally { loading.value = false; } }
function openCreate() { form.value = { id: null, name: '', email: '', phone: '', address: '', document_number: '' }; isEdit.value = false; showForm.value = true; }
function openEdit(row: Item) { form.value = { ...row }; isEdit.value = true; showForm.value = true; }
async function save() { if (!form.value.name) return; saving.value = true; try { const m = isEdit.value ? 'put' : 'post'; const r = await fetchHttpResource({ path: '/client' + (isEdit.value ? `/${form.value.id}` : ''), method: m as never, data: form.value as never }); if (r.success) { $q.notify({ type: 'positive', message: isEdit.value ? 'Actualizado' : 'Creado' }); showForm.value = false; load(); } else { $q.notify({ type: 'negative', message: r.message || 'Error' }); } } catch { $q.notify({ type: 'negative', message: 'Error' }); } finally { saving.value = false; } }
async function handleDelete() { if (!deleteTarget.value) return; try { const r = await fetchHttpResource({ path: `/client/${deleteTarget.value.id}`, method: 'delete' as never }); if (r.success) { $q.notify({ type: 'positive', message: 'Eliminado' }); load(); } else { $q.notify({ type: 'negative', message: r.message || 'Error' }); } } catch { $q.notify({ type: 'negative', message: 'Error' }); } }
onMounted(() => { void load(); });
</script>

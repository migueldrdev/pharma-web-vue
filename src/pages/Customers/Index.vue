<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useNotify } from '@composables/useNotify';
import AppPageHeader from '@components/shared/AppPageHeader.vue';
import AppConfirmDialog from '@components/shared/AppConfirmDialog.vue';
import AppFormDialog from '@components/shared/AppFormDialog.vue';
import AppEmptyState from '@components/shared/AppEmptyState.vue';
import AppStatusBadge from '@components/shared/AppStatusBadge.vue';
import { useValidation } from '@composables/useValidation';
import { useFetchHttp } from '@composables/useFetchHttp';
import { resources } from '@api-resources/GeneralApiResource';

defineOptions({ name: 'CustomersPage' });

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  document_number?: string;
}

const { fetchHttpResource } = useFetchHttp();
const { success, error } = useNotify();
const { required } = useValidation();

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
  { name: 'name', label: 'Nombre', field: 'name', align: 'left' as const },
  { name: 'document', label: 'Documento', field: 'document_number', align: 'left' as const },
  { name: 'email', label: 'Email', field: 'email', align: 'left' as const },
  { name: 'phone', label: 'Teléfono', field: 'phone', align: 'left' as const },
  { name: 'address', label: 'Dirección', field: 'address', align: 'left' as const },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'right' as const, style: 'width: 120px' },
];

async function load() {
  loading.value = true;
  try {
    const params: Record<string, unknown> = { page: 1, per_page: 50 };
    if (filter.value) params.search = filter.value;
    const res = await fetchHttpResource<Customer[] | { data: Customer[] }>({ ...resources.allClients, params }, false);
    const rawData = res.data;
    items.value = Array.isArray(rawData) ? rawData : (rawData as { data?: Customer[] })?.data ?? [];
  } catch {
    error('Error al cargar clientes');
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editing.value = false;
  form.value = { name: '', email: '', phone: '', address: '', document_number: '' };
  showDialog.value = true;
}

function openEdit(c: Customer) {
  editing.value = true;
  current.value = c;
  form.value = {
    name: c.name,
    email: c.email,
    phone: c.phone ?? '',
    address: c.address ?? '',
    document_number: c.document_number ?? '',
  };
  showDialog.value = true;
}

async function save() {
  loading.value = true;
  try {
    const data = form.value as unknown as Record<string, unknown>;
    if (editing.value && current.value) {
      await fetchHttpResource({
        ...resources.updateClient,
        paramsRoute: [String(current.value.id)],
        data,
      });
      success('Cliente actualizado correctamente');
    } else {
      await fetchHttpResource({ ...resources.createClient, data });
      success('Cliente creado correctamente');
    }
    showDialog.value = false;
    await load();
  } catch {
    error('Error al guardar cliente');
  } finally {
    loading.value = false;
  }
}

function confirmDelete(c: Customer) {
  deleting.value = c;
  showDelete.value = true;
}

async function onDelete() {
  if (!deleting.value) return;
  loading.value = true;
  try {
    await fetchHttpResource({
      ...resources.deleteClient,
      paramsRoute: [String(deleting.value.id)],
    });
    success('Cliente eliminado');
    await load();
  } catch {
    error('Error al eliminar cliente');
  } finally {
    showDelete.value = false;
    loading.value = false;
  }
}

const deleteMsg = computed(() => `¿Está seguro de que desea eliminar a "${deleting.value?.name ?? ''}"? Esta acción no se puede deshacer.`);

onMounted(() => load());
</script>

<template>
  <q-page class="q-pa-md q-gutter-md">
    <AppPageHeader title="Clientes" subtitle="Gestión de clientes y pacientes">
      <template #actions>
        <q-btn 
          color="primary" 
          icon="add" 
          label="Nuevo Cliente" 
          unelevated 
          class="pharma-btn-main" 
          @click="openCreate" 
        />
        <q-btn icon="refresh" flat round @click="load()" :loading="loading" />
      </template>
    </AppPageHeader>

    <q-card flat bordered class="pharma-card">
      <q-card-section class="q-pb-none">
        <div class="row">
          <div class="col-12 col-md-4">
            <q-input
              v-model="filter"
              label="Buscar clientes..."
              outlined
              dense
              clearable
              debounce="400"
              class="pharma-input-inset"
              @update:model-value="load()"
            >
              <template #prepend><q-icon name="search" /></template>
            </q-input>
          </div>
        </div>
      </q-card-section>

      <q-table 
        :rows="items" 
        :columns="columns" 
        row-key="id" 
        :loading="loading" 
        flat
        class="bg-transparent"
        table-header-class="text-grey-8"
      >
        <template #body-cell-name="{ row }">
          <q-td>
            <div class="row items-center q-gutter-sm">
              <q-avatar size="32px" color="primary" text-color="white" font-size="14px">
                {{ row.name.charAt(0).toUpperCase() }}
              </q-avatar>
              <span class="text-weight-medium text-dark">{{ row.name }}</span>
            </div>
          </q-td>
        </template>
        
        <template #body-cell-document="{ row }">
          <q-td>
            <AppStatusBadge 
              v-if="row.document_number" 
              status="medium" 
              :label="row.document_number" 
              outline
            />
            <span v-else class="text-grey-5">-</span>
          </q-td>
        </template>
        
        <template #body-cell-email="{ row }">
          <q-td>
            <span v-if="row.email">{{ row.email }}</span>
            <span v-else class="text-grey-5">-</span>
          </q-td>
        </template>
        
        <template #body-cell-phone="{ row }">
          <q-td>
            <span v-if="row.phone">{{ row.phone }}</span>
            <span v-else class="text-grey-5">-</span>
          </q-td>
        </template>
        
        <template #body-cell-address="{ row }">
          <q-td>
            <span v-if="row.address" class="text-grey-8">{{ row.address }}</span>
            <span v-else class="text-grey-5">-</span>
          </q-td>
        </template>

        <template #body-cell-actions="{ row }">
          <q-td class="text-right">
            <q-btn 
              icon="edit" 
              size="sm" 
              flat 
              round 
              color="primary" 
              @click="openEdit(row)" 
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn
              icon="delete"
              size="sm"
              flat
              round
              color="negative"
              @click="confirmDelete(row)"
            >
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template #no-data>
          <AppEmptyState
            title="No se encontraron clientes"
            description="Intente con otro término de búsqueda o agregue un nuevo cliente."
            icon="people_outline"
            action-label="Nuevo Cliente"
            action-icon="add"
            @action="openCreate"
          />
        </template>
      </q-table>
    </q-card>

    <AppFormDialog
      v-model="showDialog"
      :title="editing ? 'Editar Cliente' : 'Nuevo Cliente'"
      :loading="loading"
      @submit="save"
    >
      <div class="row q-col-gutter-md">
        <div class="col-12">
          <q-input
            v-model="form.name"
            label="Nombre Completo *"
            outlined
            dense
            :rules="[required('Nombre')]"
            class="pharma-input-inset"
          />
        </div>
        <div class="col-12 col-md-6">
          <q-input 
            v-model="form.document_number" 
            label="N° Documento" 
            outlined 
            dense 
            class="pharma-input-inset" 
          />
        </div>
        <div class="col-12 col-md-6">
          <q-input 
            v-model="form.phone" 
            label="Teléfono" 
            outlined 
            dense 
            class="pharma-input-inset" 
          />
        </div>
        <div class="col-12">
          <q-input 
            v-model="form.email" 
            label="Email" 
            type="email"
            outlined 
            dense 
            class="pharma-input-inset" 
          />
        </div>
        <div class="col-12">
          <q-input 
            v-model="form.address" 
            label="Dirección" 
            outlined 
            dense 
            class="pharma-input-inset"
          />
        </div>
      </div>
    </AppFormDialog>

    <AppConfirmDialog
      v-model="showDelete"
      title="Eliminar cliente"
      :message="deleteMsg"
      confirm-label="Eliminar"
      color="negative"
      @confirm="onDelete"
    />
  </q-page>
</template>

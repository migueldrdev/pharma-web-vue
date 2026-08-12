<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useNotify } from '@composables/useNotify';
import AppPageHeader from '@components/shared/AppPageHeader.vue';
import AppConfirmDialog from '@components/shared/AppConfirmDialog.vue';
import AppFormDialog from '@components/shared/AppFormDialog.vue';
import AppEmptyState from '@components/shared/AppEmptyState.vue';
import { useValidation } from '@composables/useValidation';
import { useFetchHttp } from '@composables/useFetchHttp';
import { supplierResources } from '../api-resource/purchaseResource';
import type { ISupplier } from '../interfaces/IPurchase';

defineOptions({ name: 'SuppliersPage' });

const { fetchHttpResource } = useFetchHttp();
const { success, error } = useNotify();
const { required } = useValidation();
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
  { name: 'actions', label: '', field: 'actions', align: 'center' as const, style: 'width: 100px' },
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
    error('Error al cargar proveedores');
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
      success('Proveedor actualizado correctamente');
    } else {
      await fetchHttpResource({
        ...supplierResources.create,
        data: form.value as unknown as Record<string, unknown>,
      });
      success('Proveedor registrado con éxito');
    }
    showDialog.value = false;
    await load();
  } catch {
    error('Error al guardar el proveedor');
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
    success('Proveedor eliminado exitosamente');
    await load();
  } catch {
    error('Error al eliminar el proveedor');
  } finally {
    showDelete.value = false;
  }
}

const deleteMsg = computed(() => `¿Está seguro de eliminar el proveedor "${deleting.value?.name ?? ''}"? Esta acción no se puede deshacer.`);

onMounted(() => load());
</script>

<template>
  <q-page class="q-pa-md">
    <AppPageHeader 
      title="Proveedores" 
      subtitle="Gestión de proveedores y distribuidoras farmacéuticas"
    >
      <template #actions>
        <q-btn 
          class="pharma-btn-main"
          color="primary" 
          icon="add" 
          label="Nuevo Proveedor" 
          unelevated 
          @click="openCreate" 
        />
        <q-btn icon="refresh" flat round @click="load()" :loading="loading" />
      </template>
    </AppPageHeader>

    <q-card class="pharma-card" flat>
      <q-card-section>
        <q-input
          v-model="filter"
          label="Buscar por nombre o RUC..."
          class="pharma-input-inset"
          outlined
          dense
          clearable
          debounce="400"
          @update:model-value="load()"
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>
      </q-card-section>

      <q-table 
        :rows="items" 
        :columns="columns" 
        row-key="id" 
        :loading="loading" 
        class="bg-transparent"
        flat
      >
        <template #body-cell-name="props">
          <q-td :props="props" class="text-weight-bold">
            <q-icon name="mdi-truck-delivery-outline" size="xs" color="primary" class="q-mr-sm" />
            {{ props.row.name }}
          </q-td>
        </template>

        <template #body-cell-email="props">
          <q-td :props="props" class="text-grey-8">
            {{ props.row.email || '-' }}
          </q-td>
        </template>

        <template #body-cell-phone="props">
          <q-td :props="props" class="text-grey-8">
            {{ props.row.phone || '-' }}
          </q-td>
        </template>

        <template #body-cell-actions="{ row }">
          <q-td class="text-center">
            <q-btn icon="edit" size="sm" flat round color="secondary" @click="openEdit(row)">
              <q-tooltip>Editar Proveedor</q-tooltip>
            </q-btn>
            <q-btn
              icon="delete"
              size="sm"
              flat
              round
              color="negative"
              @click="confirmDelete(row)"
            >
              <q-tooltip>Eliminar Proveedor</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width row flex-center q-pa-md">
            <AppEmptyState
              icon="mdi-account-cancel-outline"
              title="Sin proveedores registrados"
              description="No se encontraron proveedores o distribuidoras farmacéuticas en el sistema."
            >
              <template #actions>
                <q-btn
                  class="pharma-btn-main"
                  color="primary"
                  icon="add"
                  label="Nuevo Proveedor"
                  unelevated
                  @click="openCreate"
                />
              </template>
            </AppEmptyState>
          </div>
        </template>
      </q-table>
    </q-card>

    <AppFormDialog
      v-model="showDialog"
      :title="editing ? 'Editar Proveedor' : 'Nuevo Proveedor'"
      :loading="loading"
      width="600px"
      @submit="save"
    >
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-6">
          <q-input
            v-model="form.name"
            label="Razón Social / Nombre *"
            class="pharma-input-inset"
            outlined
            dense
            :rules="[required('Nombre')]"
          />
        </div>
        <div class="col-12 col-md-6">
          <q-input 
            v-model="form.email" 
            label="Correo Electrónico" 
            class="pharma-input-inset"
            outlined 
            dense 
            type="email"
          />
        </div>
        <div class="col-12 col-md-6">
          <q-input 
            v-model="form.phone" 
            label="Teléfono / Celular" 
            class="pharma-input-inset"
            outlined 
            dense 
          />
        </div>
        <div class="col-12 col-md-6">
          <q-input 
            v-model="form.address" 
            label="Dirección" 
            class="pharma-input-inset"
            outlined 
            dense 
          />
        </div>
      </div>
    </AppFormDialog>

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

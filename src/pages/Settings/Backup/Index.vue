<template>
  <q-page class="q-pa-md">
    <AppPageHeader title="Respaldo de Datos" subtitle="Gestión de copias de seguridad de la base de datos">
      <template #actions>
        <q-btn
          color="primary"
          label="Generar Copia Ahora"
          icon="cloud_upload"
          unelevated
          class="pharma-btn-main"
          :loading="generating"
          @click="generateBackup"
        />
      </template>
    </AppPageHeader>

    <div class="row q-col-gutter-md q-mt-md">
      <div class="col-12 col-md-4">
        <q-card flat bordered class="pharma-card h-full">
          <q-card-section>
            <div class="text-caption text-grey-7">Último Respaldo</div>
            <div class="text-h6">Hace 2 horas</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-4">
        <q-card flat bordered class="pharma-card h-full">
          <q-card-section>
            <div class="text-caption text-grey-7">Estado del Servicio</div>
            <div class="text-h6 text-positive">Activo</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-4">
        <q-card flat bordered class="pharma-card h-full">
          <q-card-section>
            <div class="text-caption text-grey-7">Frecuencia Automática</div>
            <div class="text-h6">Diaria (02:00 AM)</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-card flat bordered class="pharma-card q-mt-md">
      <q-table
        :rows="backups"
        :columns="columns"
        row-key="id"
        flat
        class="bg-transparent"
        :loading="loading"
        hide-pagination
      >
        <template #body-cell-status="props">
          <q-td :props="props">
            <AppStatusBadge :status="props.row.status" />
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props" class="text-right">
            <q-btn flat round dense color="primary" icon="download" @click="downloadBackup(props.row)">
              <q-tooltip>Descargar</q-tooltip>
            </q-btn>
            <q-btn flat round dense color="negative" icon="delete" @click="confirmDelete(props.row)">
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width row flex-center q-pa-md">
            <AppEmptyState
              title="No hay respaldos"
              description="Aún no se han generado copias de seguridad de la base de datos."
              icon="cloud_off"
            />
          </div>
        </template>
      </q-table>
    </q-card>

    <AppConfirmDialog
      v-model="deleteDialog.show"
      title="Eliminar Respaldo"
      :message="`¿Está seguro que desea eliminar el respaldo ${deleteDialog.backup?.name}? Esta acción no se puede deshacer.`"
      confirm-color="negative"
      @confirm="deleteBackup"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import AppPageHeader from '@components/shared/AppPageHeader.vue';
import AppStatusBadge from '@components/shared/AppStatusBadge.vue';
import AppEmptyState from '@components/shared/AppEmptyState.vue';
import AppConfirmDialog from '@components/shared/AppConfirmDialog.vue';
import type { QTableColumn } from 'quasar';

defineOptions({ name: 'BackupSettingsPage' });

const $q = useQuasar();

interface Backup {
  id: number;
  name: string;
  createdAt: string;
  size: string;
  status: 'active' | 'inactive' | 'warning' | 'expired';
}

const generating = ref(false);
const loading = ref(false);

const columns: QTableColumn<Backup>[] = [
  { name: 'name', label: 'Nombre de Archivo', field: 'name', align: 'left', sortable: true },
  { name: 'createdAt', label: 'Fecha de Creación', field: 'createdAt', align: 'left', sortable: true },
  { name: 'size', label: 'Tamaño', field: 'size', align: 'left', sortable: true },
  { name: 'status', label: 'Estado', field: 'status', align: 'center' },
  { name: 'actions', label: 'Acciones', field: (row: Backup) => row.id, align: 'right' }
];

const backups = ref<Backup[]>([
  { id: 1, name: 'backup_2026-08-11_1400.sql.gz', createdAt: '11 Ago 2026, 14:00', size: '25 MB', status: 'active' },
  { id: 2, name: 'backup_2026-08-10_0200.sql.gz', createdAt: '10 Ago 2026, 02:00', size: '24.8 MB', status: 'active' },
  { id: 3, name: 'backup_2026-08-09_0200.sql.gz', createdAt: '09 Ago 2026, 02:00', size: '24.5 MB', status: 'active' }
]);

const deleteDialog = ref<{ show: boolean; backup: Backup | null }>({
  show: false,
  backup: null
});

async function generateBackup() {
  generating.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 1500));
    $q.notify({ type: 'positive', message: 'Respaldo generado exitosamente', position: 'top-right' });
    backups.value.unshift({
      id: Date.now(),
      name: `backup_manual_${Date.now()}.sql.gz`,
      createdAt: 'Ahora',
      size: '25.1 MB',
      status: 'active'
    });
  } finally {
    generating.value = false;
  }
}

function downloadBackup(row: Backup) {
  $q.notify({ type: 'info', message: `Descargando ${row.name}...`, position: 'top-right' });
}

function confirmDelete(row: Backup) {
  deleteDialog.value.backup = row;
  deleteDialog.value.show = true;
}

function deleteBackup() {
  if (deleteDialog.value.backup) {
    const id = deleteDialog.value.backup.id;
    backups.value = backups.value.filter(b => b.id !== id);
    $q.notify({ type: 'positive', message: 'Respaldo eliminado', position: 'top-right' });
  }
}
</script>

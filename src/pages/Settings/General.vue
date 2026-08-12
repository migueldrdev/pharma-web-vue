<template>
  <q-page class="q-pa-md">
    <AppPageHeader 
      title="Configuración General" 
      subtitle="Ajustes de la empresa, comprobantes e impresoras" 
    />

    <q-card class="pharma-card q-mt-md" flat bordered>
      <q-card-section>
        <div class="text-subtitle1 text-weight-medium q-mb-md">Datos de la Empresa</div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input v-model="form.razonSocial" label="Razón Social" outlined dense class="pharma-input-inset" />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="form.ruc" label="RUC" outlined dense class="pharma-input-inset" />
          </div>
          <div class="col-12 col-md-12">
            <q-input v-model="form.direccion" label="Dirección" outlined dense class="pharma-input-inset" />
          </div>
          <div class="col-12 col-md-4">
            <q-input v-model="form.telefono" label="Teléfono" outlined dense class="pharma-input-inset" />
          </div>
          <div class="col-12 col-md-4">
            <q-input v-model="form.correo" label="Correo Electrónico" type="email" outlined dense class="pharma-input-inset" />
          </div>
          <div class="col-12 col-md-4">
            <q-input v-model="form.digemid" label="Código DIGEMID" outlined dense class="pharma-input-inset" />
          </div>
        </div>

        <q-separator class="q-my-lg" />

        <div class="text-subtitle1 text-weight-medium q-mb-md">Configuración POS & Comprobantes</div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input v-model="form.serieBoleta" label="Serie de Boleta" outlined dense class="pharma-input-inset" hint="Ej: B001" />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="form.serieFactura" label="Serie de Factura" outlined dense class="pharma-input-inset" hint="Ej: F001" />
          </div>
          <div class="col-12">
            <q-input v-model="form.mensajePie" label="Mensaje al pie del ticket" type="textarea" outlined dense class="pharma-input-inset" rows="3" />
          </div>
        </div>

        <q-separator class="q-my-lg" />

        <div class="text-subtitle1 text-weight-medium q-mb-md">Impresión</div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-select 
              v-model="form.impresora" 
              :options="impresoraOptions" 
              label="Formato de Impresión" 
              outlined 
              dense 
              class="pharma-input-inset" 
              emit-value
              map-options
            />
          </div>
        </div>

        <q-separator class="q-my-lg" />

        <div class="text-subtitle1 text-weight-medium q-mb-md">Personalización Visual</div>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-4">
            <q-toggle 
              :model-value="themeStore.isDark" 
              @update:model-value="themeStore.toggleDarkMode()"
              label="Modo Oscuro" 
              color="primary"
            />
          </div>
          <div class="col-12 col-md-8">
            <div class="text-caption q-mb-sm text-muted">Color de Marca de la Farmacia</div>
            <div class="row q-gutter-sm">
              <q-btn
                v-for="preset in themeStore.presets"
                :key="preset.id"
                round
                size="sm"
                :style="{ backgroundColor: preset.color }"
                @click="themeStore.setPreset(preset.id)"
              >
                <q-icon
                  v-if="themeStore.activePresetId === preset.id"
                  name="mdi-check"
                  color="white"
                  size="xs"
                />
              </q-btn>
            </div>
          </div>
        </div>
      </q-card-section>
      
      <q-card-actions align="right" class="q-pa-md">
        <q-btn 
          color="primary" 
          label="Guardar Cambios" 
          icon="save" 
          unelevated 
          class="pharma-btn-main" 
          :loading="saving" 
          @click="saveSettings" 
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import AppPageHeader from '@components/shared/AppPageHeader.vue';
import { useThemeStore } from '@stores/theme/themeStore';

defineOptions({ name: 'GeneralSettingsPage' });

const themeStore = useThemeStore();

const $q = useQuasar();
const saving = ref(false);

const impresoraOptions = [
  { label: 'Ticket 58mm', value: '58mm' },
  { label: 'Ticket 80mm', value: '80mm' },
  { label: 'Formato A4 (PDF)', value: 'pdf' }
];

const form = ref({
  razonSocial: 'FarmaSalud SAC',
  ruc: '20123456789',
  direccion: 'Av. Principal 123, Lima',
  telefono: '01-555-1234',
  correo: 'contacto@farmasalud.com',
  digemid: 'DIG-98765',
  serieBoleta: 'B001',
  serieFactura: 'F001',
  mensajePie: '¡Gracias por su compra! Vuelva pronto.',
  impresora: '80mm'
});

async function saveSettings() {
  saving.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    $q.notify({
      type: 'positive',
      message: 'Configuración guardada correctamente',
      position: 'top-right'
    });
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Error al guardar la configuración',
      position: 'top-right'
    });
  } finally {
    saving.value = false;
  }
}
</script>

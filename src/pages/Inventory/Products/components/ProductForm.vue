<template>
  <q-dialog v-model="isOpen" persistent maximized transition-show="slide-up" transition-hide="slide-down">
    <q-card>
      <q-bar class="bg-primary text-white">
        <q-icon :name="isEdit ? 'edit' : 'add'" class="q-mr-sm" />
        <div>{{ isEdit ? 'Editar Producto' : 'Nuevo Producto' }}</div>
        <q-space />
        <q-btn dense flat icon="close" @click="onClose" :disable="saving">
          <q-tooltip>Cancelar</q-tooltip>
        </q-btn>
      </q-bar>

      <q-card-section>
        <q-form @submit="onSubmit" ref="formRef">
          <q-scroll-area style="height: calc(100vh - 150px)">
            <div class="row q-col-gutter-md q-py-sm">
              <div class="col-12 col-md-6">

                <q-card flat bordered class="pharma-card q-mb-md">
                  <q-card-section>
                    <div class="text-subtitle2 text-primary q-mb-md">
                      <q-icon name="info" size="xs" class="q-mr-xs" /> Información Básica
                    </div>
                    <q-input v-model="form.name" label="Nombre *" outlined dense lazy-rules
                      class="pharma-input-inset"
                      :rules="[required('Nombre')]" :disable="saving">
                      <template #prepend><q-icon name="medical_services" /></template>
                    </q-input>
                    <div class="row q-mt-sm">
                      <div class="col-6 q-pr-sm">
                        <q-input v-model="form.code" label="Código *" outlined dense lazy-rules
                          class="pharma-input-inset"
                          :rules="[required('Código')]" :disable="saving">
                          <template #prepend><q-icon name="qr_code" /></template>
                          <template #append>
                            <q-btn icon="casino" flat dense round size="sm" @click="generateCode" :disable="saving">
                              <q-tooltip>Generar código</q-tooltip>
                            </q-btn>
                          </template>
                        </q-input>
                      </div>
                      <div class="col-6 q-pl-sm">
                        <q-input v-model="form.pharmaceutical_form" label="Forma Farmacéutica *" outlined dense lazy-rules
                          class="pharma-input-inset"
                          :rules="[required('Forma Farmacéutica')]" :disable="saving">
                          <template #prepend><q-icon name="science" /></template>
                        </q-input>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <q-card flat bordered class="pharma-card q-mb-md">
                  <q-card-section>
                    <div class="text-subtitle2 text-primary q-mb-md">
                      <q-icon name="category" size="xs" class="q-mr-xs" /> Categorización
                    </div>
                    <div class="row q-col-gutter-sm">
                      <div class="col-6">
                        <q-select v-model="form.category_id" :options="categoryOptions" label="Categoría *" outlined dense
                          class="pharma-input-inset"
                          emit-value map-options :rules="[required('Categoría')]" :disable="saving">
                          <template #prepend><q-icon name="folder" /></template>
                        </q-select>
                      </div>
                      <div class="col-6">
                        <q-select v-model="form.lab_id" :options="labOptions" label="Laboratorio *" outlined dense
                          class="pharma-input-inset"
                          emit-value map-options :rules="[required('Laboratorio')]" :disable="saving">
                          <template #prepend><q-icon name="business" /></template>
                        </q-select>
                      </div>
                      <div class="col-6">
                        <q-select v-model="form.type_id" :options="typeOptions" label="Tipo *" outlined dense
                          class="pharma-input-inset"
                          emit-value map-options :rules="[required('Tipo')]" :disable="saving">
                          <template #prepend><q-icon name="label" /></template>
                        </q-select>
                      </div>
                      <div class="col-6">
                        <q-select v-model="form.presentation_id" :options="presentationOptions" label="Presentación *" outlined dense
                          class="pharma-input-inset"
                          emit-value map-options :rules="[required('Presentación')]" :disable="saving">
                          <template #prepend><q-icon name="inventory" /></template>
                        </q-select>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <q-card flat bordered class="pharma-card q-mb-md">
                  <q-card-section>
                    <div class="text-subtitle2 text-primary q-mb-md">
                      <q-icon name="image" size="xs" class="q-mr-xs" /> Imagen
                    </div>
                    <div class="flex flex-center column">
                      <q-img v-if="imagePreview || form.image" :src="imagePreview || form.image"
                        style="height: 160px; max-width: 200px" class="rounded-borders" fit="cover" />
                      <div v-else class="bg-grey-3 rounded-borders flex flex-center" style="height: 120px; width: 180px">
                        <q-icon name="image" size="48px" color="grey-5" />
                      </div>
                      <div class="q-mt-sm q-gutter-x-sm">
                        <q-btn icon="upload" label="Subir" color="primary" outline size="sm" @click="triggerUpload" :disable="saving" />
                        <q-btn v-if="form.image || imagePreview" icon="delete" label="Eliminar" color="negative" outline size="sm" @click="removeImage" :disable="saving" />
                      </div>
                      <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-12 col-md-6">
                <q-card flat bordered class="pharma-card q-mb-md">
                  <q-card-section>
                    <div class="text-subtitle2 text-primary q-mb-md">
                      <q-icon name="monetization_on" size="xs" class="q-mr-xs" /> Stock y Precios
                    </div>
                    <div class="row q-col-gutter-sm">
                      <div class="col-6">
                        <q-input v-model.number="form.stock" label="Stock Inicial *" outlined dense type="number" min="0"
                          class="pharma-input-inset"
                          :rules="[(v: number) => v >= 0 || '>= 0']" :disable="saving">
                          <template #prepend><q-icon name="inventory_2" /></template>
                        </q-input>
                      </div>
                      <div class="col-6">
                        <q-input v-model.number="form.price" label="Precio S/ *" outlined dense type="number" min="0" step="0.01"
                          class="pharma-input-inset"
                          :rules="[(v: number) => v > 0 || '> 0']" :disable="saving">
                          <template #prepend><q-icon name="attach_money" /></template>
                        </q-input>
                      </div>
                      <div class="col-12">
                        <q-input v-model.number="form.min_stock" label="Stock Mínimo" outlined dense type="number" min="0" class="pharma-input-inset" :disable="saving">
                          <template #prepend><q-icon name="warning" /></template>
                        </q-input>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <q-card flat bordered class="pharma-card q-mb-md">
                  <q-card-section>
                    <div class="text-subtitle2 text-primary q-mb-md">
                      <q-icon name="description" size="xs" class="q-mr-xs" /> Información Adicional
                    </div>
                    <div class="row q-col-gutter-sm">
                      <div class="col-12">
                        <q-input v-model="form.description" label="Descripción" outlined dense type="textarea" rows="3" maxlength="500" class="pharma-input-inset" :disable="saving" />
                      </div>
                      <div class="col-6">
                        <q-input v-model="form.batch" label="N° Lote" outlined dense class="pharma-input-inset" :disable="saving" />
                      </div>
                      <div class="col-6">
                        <q-input v-model="form.concentration" label="Concentración" outlined dense hint="500mg, 250ml" class="pharma-input-inset" :disable="saving" />
                      </div>
                      <div class="col-6">
                        <q-input
                          :model-value="formatDateDisplay(form.expiration_date)"
                          label="Fecha Vencimiento"
                          outlined
                          dense
                          readonly
                          class="pharma-input-inset"
                          :disable="saving"
                        >
                          <template #prepend><q-icon name="event" /></template>
                          <template #append>
                            <q-icon name="close" class="cursor-pointer" v-if="form.expiration_date" @click="form.expiration_date = ''" />
                          </template>
                          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                            <q-date
                              :model-value="toQDateFormat(form.expiration_date)"
                              @update:model-value="(v: string) => form.expiration_date = fromQDateFormat(v)"
                              mask="YYYY/MM/DD"
                              :locale="dateLocale"
                              today-btn
                            >
                              <div class="row items-center justify-end">
                                <q-btn v-close-popup label="Cerrar" color="primary" flat />
                              </div>
                            </q-date>
                          </q-popup-proxy>
                        </q-input>
                      </div>
                      <div class="col-6">
                        <q-input
                          :model-value="formatDateDisplay(form.manufacturing_date)"
                          label="Fecha Fabricación"
                          outlined
                          dense
                          readonly
                          class="pharma-input-inset"
                          :disable="saving"
                        >
                          <template #prepend><q-icon name="event" /></template>
                          <template #append>
                            <q-icon name="close" class="cursor-pointer" v-if="form.manufacturing_date" @click="form.manufacturing_date = ''" />
                          </template>
                          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                            <q-date
                              :model-value="toQDateFormat(form.manufacturing_date)"
                              @update:model-value="(v: string) => form.manufacturing_date = fromQDateFormat(v)"
                              mask="YYYY/MM/DD"
                              :locale="dateLocale"
                              today-btn
                            >
                              <div class="row items-center justify-end">
                                <q-btn v-close-popup label="Cerrar" color="primary" flat />
                              </div>
                            </q-date>
                          </q-popup-proxy>
                        </q-input>
                      </div>
                      <div class="col-6">
                        <q-select v-model="form.storage_condition_id" :options="storageOptions" label="Almacenamiento" outlined dense
                          class="pharma-input-inset"
                          emit-value map-options :disable="saving" />
                      </div>
                      <div class="col-6">
                        <q-select v-model="form.status" :options="statusOptions" label="Estado *" outlined dense
                          class="pharma-input-inset"
                          emit-value map-options :rules="[required('Estado')]" :disable="saving" />
                      </div>
                      <div class="col-6">
                        <q-checkbox v-model="form.requires_prescription" label="Requiere Receta" :disable="saving" />
                      </div>
                      <div class="col-6">
                        <q-checkbox v-model="form.is_controlled" label="Medicamento Controlado" :disable="saving" />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-scroll-area>

          <q-separator />
          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="Cancelar" @click="onClose" :disable="saving" />
            <q-btn type="submit" color="primary" class="pharma-btn-main" :label="isEdit ? 'Actualizar' : 'Crear'" :loading="saving" unelevated />
          </q-card-actions>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useComboStore } from '@stores/combos/comboStore';
import type { IComboItem } from '@interfaces/IComboItem';
import type { IProduct } from '../interfaces/IProduct';
import { useValidation } from '@composables/useValidation';
import { useProductForm } from '../composables/useProductForm';

defineOptions({ name: 'ProductForm' });

const props = defineProps<{
  modelValue: boolean;
  product: IProduct | null;
  isEdit: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  saved: [];
}>();

const comboStore = useComboStore();
const {
  form, saving, imagePreview,
  populateFromProduct, resetForm, generateCode,
  setImageFile, removeImage, save,
} = useProductForm();
const { required } = useValidation();

const formRef = ref<{ validate: () => Promise<boolean> } | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

const categoryOptions = computed(() => comboStore.getComboData('categoriesCombo'));
const labOptions = computed(() => comboStore.getComboData('labsCombo'));
const typeOptions = computed(() => comboStore.getComboData('productTypesCombo'));
const presentationOptions = computed(() => comboStore.getComboData('productPresentationsCombo'));
const storageOptions = computed(() => comboStore.getComboData('storageConditionsCombo'));
const statusOptions: IComboItem[] = [
  { label: 'Activo', value: 'active' },
  { label: 'Inactivo', value: 'inactive' },
  { label: 'Descontinuado', value: 'discontinued' },
  { label: 'Agotado', value: 'out_of_stock' },
];

const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

watch(
  () => [props.modelValue, props.product, props.isEdit] as const,
  ([open, p, edit]) => {
    if (open) {
      if (edit && p) {
        populateFromProduct(p);
      } else {
        resetForm();
      }
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

function triggerUpload() { fileInput.value?.click(); }

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) setImageFile(file);
}

async function onSubmit() {
  const valid = await formRef.value?.validate();
  if (!valid) return;
  const ok = await save(props.isEdit, props.product?.id);
  if (ok) emit('saved');
}

function onClose() {
  if (saving.value) return;
  emit('update:modelValue', false);
}

const dateLocale = {
  days: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  daysShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthsShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
};

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  if (!y || !m || !d) return dateStr;
  return `${d}/${m}/${y}`;
}

function toQDateFormat(dateStr: string): string {
  if (!dateStr) return '';
  return dateStr.replace(/-/g, '/');
}

function fromQDateFormat(qDate: string): string {
  if (!qDate) return '';
  return qDate.replace(/\//g, '-');
}
</script>

<style scoped>
.hidden { display: none; }
</style>

<template>
  <q-dialog v-model="isOpen" persistent transition-show="scale" transition-hide="scale">
    <q-card style="width: 850px; max-width: 95vw; max-height: 90vh" class="column">
      <!-- Header -->
      <q-card-section class="bg-primary text-white row items-center q-pb-sm">
        <q-avatar icon="auto_awesome" color="white" text-color="primary" size="36px" class="q-mr-sm" />
        <div>
          <div class="text-h6 text-weight-bold">Diagnóstico y Sugerencias de IA</div>
          <div class="text-caption text-blue-1">Análisis predictivo de demanda y reabastecimiento inteligente</div>
        </div>
        <q-space />
        <q-btn icon="refresh" flat round dense color="white" :loading="loading" @click="fetchPredictions">
          <q-tooltip>Actualizar diagnóstico</q-tooltip>
        </q-btn>
        <q-btn icon="close" flat round dense v-close-popup class="q-ml-sm" />
      </q-card-section>

      <!-- Content -->
      <q-card-section class="col q-pa-md scroll">
        <!-- KPIs Summary -->
        <div class="row q-col-gutter-sm q-mb-md">
          <div class="col-12 col-sm-3">
            <q-card flat bordered class="q-pa-sm bg-grey-1 text-center">
              <div class="text-caption text-grey-7">Analizados</div>
              <div class="text-h6 text-weight-bolder text-primary">{{ items.length }}</div>
            </q-card>
          </div>
          <div class="col-12 col-sm-3">
            <q-card flat bordered class="q-pa-sm bg-red-1 text-center">
              <div class="text-caption text-negative text-weight-medium">Críticos / Agotados</div>
              <div class="text-h6 text-weight-bolder text-negative">{{ criticalCount }}</div>
            </q-card>
          </div>
          <div class="col-12 col-sm-3">
            <q-card flat bordered class="q-pa-sm bg-amber-1 text-center">
              <div class="text-caption text-warning text-weight-medium">Stock Bajo</div>
              <div class="text-h6 text-weight-bolder text-warning">{{ warningCount }}</div>
            </q-card>
          </div>
          <div class="col-12 col-sm-3">
            <q-card flat bordered class="q-pa-sm bg-green-1 text-center">
              <div class="text-caption text-positive text-weight-medium">Nivel Óptimo</div>
              <div class="text-h6 text-weight-bolder text-positive">{{ optimalCount }}</div>
            </q-card>
          </div>
        </div>

        <!-- Filter tabs & Search -->
        <div class="row q-col-gutter-sm items-center q-mb-sm">
          <div class="col-12 col-sm-7">
            <q-btn-toggle
              v-model="activeFilter"
              dense
              no-caps
              rounded
              unelevated
              toggle-color="primary"
              color="grey-3"
              text-color="grey-8"
              :options="[
                { label: `Todos (${items.length})`, value: 'all' },
                { label: `Críticos (${criticalCount})`, value: 'critical' },
                { label: `Bajos (${warningCount})`, value: 'warning' },
                { label: `Óptimos (${optimalCount})`, value: 'optimal' },
              ]"
            />
          </div>
          <div class="col-12 col-sm-5">
            <q-input
              v-model="searchQuery"
              dense
              outlined
              placeholder="Filtrar por producto..."
              clearable
              class="pharma-input-inset"
            >
              <template #prepend><q-icon name="search" size="xs" /></template>
            </q-input>
          </div>
        </div>

        <q-separator class="q-my-sm" />

        <!-- Loading state -->
        <div v-if="loading" class="row flex-center q-pa-xl">
          <q-spinner-dots size="50px" color="primary" />
          <div class="full-width text-center q-mt-md text-grey-7">Generando diagnóstico con IA...</div>
        </div>

        <!-- Empty state -->
        <div v-else-if="filteredItems.length === 0" class="row flex-center q-pa-lg text-grey-6 text-center">
          <div>
            <q-icon name="psychology_alt" size="48px" color="grey-4" />
            <div class="text-subtitle1 q-mt-sm">No hay sugerencias para este filtro</div>
          </div>
        </div>

        <!-- Predictions list -->
        <div v-else class="q-gutter-y-sm">
          <q-card
            v-for="item in filteredItems"
            :key="item.id"
            flat
            bordered
            :class="getItemBorderClass(item)"
            class="q-pa-sm transition-all"
          >
            <div class="row items-center justify-between no-wrap">
              <div class="row items-center no-wrap ellipsis" style="max-width: 70%">
                <q-avatar
                  size="28px"
                  :color="getItemColor(item)"
                  text-color="white"
                  :icon="getItemIcon(item)"
                  class="q-mr-sm"
                />
                <div class="ellipsis">
                  <span class="text-weight-bold text-dark text-body2">{{ item.name }}</span>
                  <span class="text-caption text-grey-6 q-ml-sm">({{ item.code }})</span>
                </div>
              </div>
              <div class="row items-center q-gutter-x-xs">
                <q-badge :color="item.stock <= 0 ? 'negative' : item.stock <= 5 ? 'warning' : 'positive'" outline>
                  Stock: {{ item.stock }}
                </q-badge>
              </div>
            </div>

            <div class="q-mt-xs q-pl-lg">
              <div class="text-body2 text-grey-8 bg-grey-1 q-pa-xs rounded-borders text-italic">
                <q-icon name="lightbulb" size="14px" color="amber-8" class="q-mr-xs" />
                {{ item.ai_suggestion }}
              </div>
            </div>
          </q-card>
        </div>
      </q-card-section>

      <!-- Footer Actions -->
      <q-separator />
      <q-card-actions align="right" class="q-pa-md bg-grey-1">
        <q-btn flat label="Cerrar" color="grey-8" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useFetchHttp } from '@composables/useFetchHttp';
import { predictionResources } from '@/api-resources/predictionResource';

defineOptions({ name: 'AiPredictionsDialog' });

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

interface IPredictionItem {
  id: number;
  name: string;
  code: string;
  stock: number;
  ai_suggestion: string;
}

const { fetchHttpResource } = useFetchHttp();

const loading = ref(false);
const items = ref<IPredictionItem[]>([]);
const activeFilter = ref<'all' | 'critical' | 'warning' | 'optimal'>('all');
const searchQuery = ref('');

const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const criticalCount = computed(() =>
  items.value.filter((i) => i.ai_suggestion.toLowerCase().includes('crítico') || i.stock <= 0).length
);

const warningCount = computed(() =>
  items.value.filter((i) =>
    (i.ai_suggestion.toLowerCase().includes('bajo') || i.ai_suggestion.toLowerCase().includes('reabastecimiento')) &&
    !i.ai_suggestion.toLowerCase().includes('crítico') &&
    i.stock > 0
  ).length
);

const optimalCount = computed(() =>
  items.value.filter((i) => i.ai_suggestion.toLowerCase().includes('óptimo') || i.ai_suggestion.toLowerCase().includes('optimo')).length
);

const filteredItems = computed(() => {
  let list = items.value;

  if (activeFilter.value === 'critical') {
    list = list.filter((i) => i.ai_suggestion.toLowerCase().includes('crítico') || i.stock <= 0);
  } else if (activeFilter.value === 'warning') {
    list = list.filter((i) =>
      (i.ai_suggestion.toLowerCase().includes('bajo') || i.ai_suggestion.toLowerCase().includes('reabastecimiento')) &&
      !i.ai_suggestion.toLowerCase().includes('crítico') &&
      i.stock > 0
    );
  } else if (activeFilter.value === 'optimal') {
    list = list.filter((i) => i.ai_suggestion.toLowerCase().includes('óptimo') || i.ai_suggestion.toLowerCase().includes('optimo'));
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter((i) => i.name.toLowerCase().includes(q) || i.code.toLowerCase().includes(q));
  }

  return list;
});

function getItemBorderClass(item: IPredictionItem): string {
  const text = item.ai_suggestion.toLowerCase();
  if (text.includes('crítico') || item.stock <= 0) return 'border-negative';
  if (text.includes('bajo') || text.includes('reabastecimiento')) return 'border-warning';
  return 'border-positive';
}

function getItemColor(item: IPredictionItem): string {
  const text = item.ai_suggestion.toLowerCase();
  if (text.includes('crítico') || item.stock <= 0) return 'negative';
  if (text.includes('bajo') || text.includes('reabastecimiento')) return 'warning';
  return 'positive';
}

function getItemIcon(item: IPredictionItem): string {
  const text = item.ai_suggestion.toLowerCase();
  if (text.includes('crítico') || item.stock <= 0) return 'error';
  if (text.includes('bajo') || text.includes('reabastecimiento')) return 'warning';
  return 'check_circle';
}

async function fetchPredictions() {
  loading.value = true;
  try {
    const res = await fetchHttpResource<{ data?: IPredictionItem[] } | IPredictionItem[]>(
      predictionResources.index({ per_page: 100 })
    );
    if (res.success && res.data) {
      if (Array.isArray(res.data)) {
        items.value = res.data;
      } else if (Array.isArray((res.data as { data?: IPredictionItem[] }).data)) {
        items.value = (res.data as { data: IPredictionItem[] }).data;
      }
    }
  } catch {
    items.value = [];
  } finally {
    loading.value = false;
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      void fetchPredictions();
    }
  }
);
</script>

<style scoped>
.border-negative {
  border-left: 4px solid var(--q-negative) !important;
}
.border-warning {
  border-left: 4px solid var(--q-warning) !important;
}
.border-positive {
  border-left: 4px solid var(--q-positive) !important;
}
</style>

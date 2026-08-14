<template>
  <q-page class="q-pa-md q-col-gutter-y-md">
    <AppPageHeader title="Punto de Venta" subtitle="Nueva Venta Rápida" />

    <div class="row q-col-gutter-lg">
      <!-- Columna Izquierda: Búsqueda y Carrito -->
      <div class="col-xs-12 col-md-8">
        <q-card class="pharma-card" flat bordered>
          <q-card-section class="q-pa-md">
            <!-- Buscador de Productos -->
            <div class="row q-col-gutter-sm items-center q-mb-md">
              <div class="col-12 col-sm-6">
                <q-select
                  ref="searchInput"
                  v-model="currentProduct"
                  :options="productOptions"
                  label="Buscar producto (Código o Nombre)"
                  class="pharma-input-inset text-subtitle1"
                  outlined
                  dense
                  use-input
                  input-debounce="300"
                  hide-selected
                  fill-input
                  autofocus
                  @filter="filterProducts"
                  @update:model-value="onProductSelected"
                  emit-value
                  map-options
                  behavior="menu"
                >
                  <template #prepend>
                    <q-icon name="search" />
                  </template>
                  <template #no-option>
                    <q-item>
                      <q-item-section class="text-grey"> Sin resultados </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
              <div class="col-12 col-sm-3">
                <q-input
                  v-model.number="currentQuantity"
                  type="number"
                  label="Cant."
                  class="pharma-input-inset"
                  outlined
                  dense
                  min="1"
                  @keyup.enter="addProductToCart"
                />
              </div>
              <div class="col-12 col-sm-3">
                <q-btn
                  color="primary"
                  icon="add"
                  label="Agregar (Enter)"
                  @click="addProductToCart"
                  unelevated
                  class="full-width q-py-sm"
                  :disable="!currentProduct"
                />
              </div>
            </div>

            <q-separator class="q-mb-md" />

            <!-- Carrito -->
            <div v-if="cart.length > 0">
              <q-table
                :rows="cart"
                :columns="cartColumns"
                row-key="product_id"
                dense
                flat
                hide-pagination
                :rows-per-page-options="[0]"
                class="pharma-table"
              >
                <!-- Columna: Cantidad con Controles -->
                <template #body-cell-quantity="props">
                  <q-td :props="props" class="text-center" style="width: 140px">
                    <div class="row items-center justify-center no-wrap">
                      <q-btn
                        icon="remove"
                        size="sm"
                        flat
                        round
                        color="negative"
                        @click="updateItemQuantity(props.row, -1)"
                        :disable="props.row.quantity <= 1"
                      />
                      <q-input
                        v-model.number="props.row.quantity"
                        type="number"
                        dense
                        outlined
                        style="width: 60px"
                        class="text-center q-mx-xs pharma-input-inset"
                        @update:model-value="recalculateCart"
                      />
                      <q-btn
                        icon="add"
                        size="sm"
                        flat
                        round
                        color="positive"
                        @click="updateItemQuantity(props.row, 1)"
                      />
                    </div>
                  </q-td>
                </template>

                <!-- Columna: Acciones -->
                <template #body-cell-actions="props">
                  <q-td :props="props">
                    <q-btn
                      icon="delete"
                      size="sm"
                      flat
                      round
                      color="negative"
                      @click="removeFromCart(props.row)"
                    />
                  </q-td>
                </template>
              </q-table>
            </div>

            <AppEmptyState
              v-else
              icon="shopping_cart"
              title="Carrito Vacío"
              description="Busque y agregue productos para iniciar la venta"
            />
          </q-card-section>
        </q-card>
      </div>

      <!-- Columna Derecha: Resumen y Pago -->
      <div class="col-xs-12 col-md-4">
        <q-card class="pharma-card q-pa-sm" flat bordered>
          <q-card-section>
            <!-- Total a Pagar -->
            <div class="text-center q-mb-lg q-pa-md rounded-borders" style="background-color: var(--surface-base)">
              <div class="text-subtitle2 text-grey-8 text-uppercase">Total a Pagar</div>
              <div class="text-h3 text-weight-bolder text-primary">
                S/ {{ cartTotal.toFixed(2) }}
              </div>
            </div>

            <!-- Datos del Cliente -->
            <div class="text-subtitle2 text-weight-bold q-mb-sm text-blue-grey-8">
              Datos del Cliente
            </div>
            <q-select
              v-model="saleData.client_id"
              :options="clientOptions"
              label="Cliente (Frecuente)"
              class="pharma-input-inset q-mb-sm"
              outlined
              dense
              clearable
              emit-value
              map-options
            >
              <template #prepend>
                <q-icon name="person" />
              </template>
            </q-select>

            <q-input
              v-if="!saleData.client_id"
              v-model="saleData.customer_name"
              label="Nombre (Cliente Rápido)"
              class="pharma-input-inset q-mb-md"
              outlined
              dense
            />

            <q-separator class="q-my-md" />

            <!-- Documento de Pago -->
            <div class="text-subtitle2 text-weight-bold q-mb-sm text-blue-grey-8">Comprobante</div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="saleData.document_type_id"
                  :options="docTypeOptions"
                  label="Tipo Comprobante"
                  class="pharma-input-inset q-mb-sm"
                  outlined
                  dense
                  clearable
                  emit-value
                  map-options
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="saleData.document_number"
                  label="N° Documento"
                  class="pharma-input-inset q-mb-sm"
                  outlined
                  dense
                />
              </div>
            </div>

            <!-- Botón Principal -->
            <q-btn
              color="primary"
              icon="mdi-point-of-sale"
              label="Registrar Venta"
              :loading="submitting"
              :disable="cart.length === 0"
              @click="submitSale"
              unelevated
              size="lg"
              class="full-width q-mt-md pharma-btn-main text-weight-bold"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AppPageHeader from '@components/shared/AppPageHeader.vue';
import AppEmptyState from '@components/shared/AppEmptyState.vue';
import { resources } from '@api-resources/GeneralApiResource';
import { useFetchHttp } from '@composables/useFetchHttp';
import { useCombo } from '@composables/useCombo';
import { useNotify } from '@composables/useNotify';
import { usePosCart, type CartItem } from './composables/usePosCart';
import type { IComboItem } from '@interfaces/IComboItem';

const router = useRouter();
const { fetchHttpResource } = useFetchHttp();
const { loadComboData } = useCombo();
const { warning, success, error: notifyError } = useNotify();

const productOptions = ref<IComboItem[]>([]);
const clientOptions = ref<IComboItem[]>([]);
const docTypeOptions = ref<IComboItem[]>([]);
const allProducts = ref<IComboItem[]>([]);
const submitting = ref(false);

const {
  cart,
  cartTotal,
  currentProduct,
  currentQuantity,
  searchInput,
  onProductSelected,
  addProductToCart,
  updateItemQuantity,
  recalculateCart,
  removeFromCart,
} = usePosCart(allProducts);

const saleData = ref({
  client_id: null as number | null,
  customer_name: '',
  document_type_id: null as number | null,
  document_number: '',
});

const cartColumns = [
  { name: 'name', label: 'Producto', field: 'name', align: 'left' as const },
  {
    name: 'price',
    label: 'Precio U.',
    field: (row: CartItem) => `S/ ${row.price.toFixed(2)}`,
    align: 'right' as const,
  },
  { name: 'quantity', label: 'Cant.', field: 'quantity', align: 'center' as const },
  {
    name: 'subtotal',
    label: 'Subtotal',
    field: (row: CartItem) => `S/ ${row.subtotal.toFixed(2)}`,
    align: 'right' as const,
  },
  { name: 'actions', label: '', field: 'actions', align: 'center' as const },
];

function filterProducts(val: string, update: (_fn: () => void) => void) {
  update(() => {
    if (!val) {
      productOptions.value = allProducts.value.slice(0, 20);
      return;
    }
    const needle = val.toLowerCase();
    productOptions.value = allProducts.value.filter(
      (p) =>
        p.label.toLowerCase().includes(needle) ||
        (Boolean((p as Record<string, unknown>).description) &&
          String((p as Record<string, unknown>).description).toLowerCase().includes(needle)),
    );
  });
}

async function submitSale() {
  if (cart.value.length === 0) {
    warning('Agregue al menos un producto', { position: 'top-right', timeout: 2000 });
    return;
  }

  submitting.value = true;
  try {
    const details = cart.value.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal,
    }));

    const response = await fetchHttpResource({
      ...resources.createSale,
      data: {
        sale_date: new Date().toISOString().split('T')[0],
        total: cartTotal.value,
        client_id: saleData.value.client_id || null,
        customer_name: saleData.value.customer_name || null,
        document_type_id: saleData.value.document_type_id || null,
        document_number: saleData.value.document_number || null,
        details,
      },
    });

    if (response.success) {
      success('Venta registrada exitosamente', { position: 'top-right', timeout: 2000 });
      void router.push({ name: 'sales' });
    } else {
      notifyError(response.message || 'Error al registrar venta');
    }
  } catch {
    notifyError('Error al registrar la venta');
  } finally {
    submitting.value = false;
  }
}

onMounted(async () => {
  try {
    const [products, clients, docTypes] = await Promise.all([
      loadComboData('productsCombo', false),
      loadComboData('clientsCombo', false),
      loadComboData('documentTypesCombo', false),
    ]);

    allProducts.value = products;
    clientOptions.value = clients;
    docTypeOptions.value = docTypes;
    productOptions.value = allProducts.value.slice(0, 20);
  } catch {
    notifyError('Error al cargar datos');
  }
});
</script>

<style scoped lang="scss">
.pharma-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.pharma-input-inset {
  :deep(.q-field__control) {
    background-color: var(--surface-base);
    border-radius: 8px;
    &:before {
      border-color: var(--border-subtle) !important;
    }
  }
  :deep(.q-field__native),
  :deep(.q-field__input) {
    font-weight: 500;
  }
}

.pharma-btn-main {
  border-radius: 8px;
  height: 54px;
}
</style>

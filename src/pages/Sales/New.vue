<template>
  <q-page class="q-pa-md">
    <AppPageHeader title="Nueva Venta" subtitle="Registrar venta de productos" />

    <div class="row q-col-gutter-md">
      <div class="col-md-8 col-xs-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-primary q-mb-md">Productos</div>

            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-md-5 col-xs-12">
                <q-select
                  v-model="currentProduct"
                  :options="productOptions"
                  label="Buscar producto"
                  outlined
                  dense
                  use-input
                  input-debounce="300"
                  @filter="filterProducts"
                  @update:model-value="addProductToCart"
                  emit-value
                  map-options
                  behavior="menu"
                />
              </div>
              <div v-if="currentProduct" class="col-md-3 col-xs-6">
                <q-input v-model.number="currentQuantity" type="number" label="Cantidad" outlined dense min="1" />
              </div>
              <div v-if="currentProduct" class="col-md-2 col-xs-6">
                <q-input v-model.number="currentPrice" type="number" label="Precio" outlined dense min="0" prefix="S/" />
              </div>
              <div v-if="currentProduct" class="col-md-2 col-xs-12">
                <q-btn color="primary" icon="add" label="Agregar" @click="addProductToCart" unelevated class="full-width" />
              </div>
            </div>

            <q-table
              v-if="cart.length > 0"
              :rows="cart"
              :columns="cartColumns"
              row-key="product_id"
              dense
              flat
              hide-pagination
            >
              <template #body-cell-actions="props">
                <q-td :props="props">
                  <q-btn icon="delete" size="sm" flat round color="negative" @click="removeFromCart(props.row)" />
                </q-td>
              </template>
            </q-table>

            <div v-else class="text-center text-grey q-py-lg">
              <q-icon name="shopping_cart" size="3em" />
              <p>Agregue productos al carrito</p>
            </div>

            <q-separator class="q-my-md" />
            <div class="row items-center justify-end">
              <div class="text-h6 text-green-8 q-mr-md">Total: S/ {{ cartTotal.toFixed(2) }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-md-4 col-xs-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-primary q-mb-md">Cliente</div>
            <q-select
              v-model="saleData.client_id"
              :options="clientOptions"
              label="Cliente (opcional)"
              outlined
              dense
              clearable
              emit-value
              map-options
              class="q-mb-sm"
            />
            <q-input v-model="saleData.customer_name" label="Nombre cliente" outlined dense class="q-mb-sm" />
            <q-select
              v-model="saleData.document_type_id"
              :options="docTypeOptions"
              label="Tipo documento"
              outlined
              dense
              clearable
              emit-value
              map-options
              class="q-mb-sm"
            />
            <q-input v-model="saleData.document_number" label="N° Documento" outlined dense class="q-mb-md" />

            <q-btn
              color="primary"
              icon="point_of_sale"
              label="Registrar Venta"
              :loading="submitting"
              :disable="cart.length === 0"
              @click="submitSale"
              unelevated
              class="full-width"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import AppPageHeader from '@components/shared/AppPageHeader.vue';
import { resources } from './api-resource/ApiResource';
import { useFetchHttp } from '@composables/useFetchHttp';
import { useCombo } from '@composables/useCombo';
import type { IComboItem } from '@interfaces/IComboItem';

const router = useRouter();
const { fetchHttpResource } = useFetchHttp();
const { loadComboData } = useCombo();
const $q = useQuasar();

interface CartItem {
  product_id: number;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

const productOptions = ref<IComboItem[]>([]);
const clientOptions = ref<IComboItem[]>([]);
const docTypeOptions = ref<IComboItem[]>([]);
const allProducts = ref<IComboItem[]>([]);

const currentProduct = ref<number | null>(null);
const currentQuantity = ref(1);
const currentPrice = ref(0);
const cart = ref<CartItem[]>([]);
const submitting = ref(false);

const saleData = ref({
  client_id: null as number | null,
  customer_name: '',
  document_type_id: null as number | null,
  document_number: '',
});

const cartTotal = computed(() => cart.value.reduce((sum, item) => sum + item.subtotal, 0));

const cartColumns = [
  { name: 'name', label: 'Producto', field: 'name', align: 'left' as const },
  { name: 'quantity', label: 'Cant.', field: 'quantity', align: 'center' as const },
  { name: 'price', label: 'Precio U.', field: (row: CartItem) => `S/ ${row.price.toFixed(2)}`, align: 'right' as const },
  { name: 'subtotal', label: 'Subtotal', field: (row: CartItem) => `S/ ${row.subtotal.toFixed(2)}`, align: 'right' as const },
  { name: 'actions', label: '', field: 'actions', align: 'center' as const },
];

function filterProducts(val: string, update: (fn: () => void) => void) {
  update(() => {
    if (!val) {
      productOptions.value = allProducts.value.slice(0, 20);
      return;
    }
    const needle = val.toLowerCase();
    productOptions.value = allProducts.value.filter(
      (p) => p.label.toLowerCase().includes(needle),
    );
  });
}

function addProductToCart() {
  if (!currentProduct.value || currentQuantity.value < 1) return;

  const product = allProducts.value.find((p) => p.value === currentProduct.value);
  if (!product) return;

  const existing = cart.value.find((item) => item.product_id === currentProduct.value);
  if (existing) {
    existing.quantity += currentQuantity.value;
    existing.subtotal = existing.quantity * existing.price;
  } else {
    cart.value.push({
      product_id: currentProduct.value,
      name: product.label,
      quantity: currentQuantity.value,
      price: currentPrice.value || 0,
      subtotal: currentQuantity.value * (currentPrice.value || 0),
    });
  }

  currentProduct.value = null;
  currentQuantity.value = 1;
  currentPrice.value = 0;
}

function removeFromCart(item: CartItem) {
  cart.value = cart.value.filter((i) => i.product_id !== item.product_id);
}

async function submitSale() {
  if (cart.value.length === 0) {
    $q.notify({ type: 'warning', message: 'Agregue al menos un producto' });
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
      ...resources.createSale(),
      data: {
        sale_date: new Date().toISOString().split('T')[0],
        total: cartTotal.value,
        client_id: saleData.value.client_id,
        customer_name: saleData.value.customer_name || undefined,
        document_type_id: saleData.value.document_type_id,
        document_number: saleData.value.document_number || undefined,
        details,
      },
    });

    if (response.success) {
      $q.notify({ type: 'positive', message: 'Venta registrada exitosamente' });
      router.push({ name: 'sales' });
    } else {
      $q.notify({ type: 'negative', message: response.message || 'Error al registrar venta' });
    }
  } catch {
    $q.notify({ type: 'negative', message: 'Error al registrar la venta' });
  } finally {
    submitting.value = false;
  }
}

onMounted(async () => {
  try {
    allProducts.value = await loadComboData('productsCombo', false);
    productOptions.value = allProducts.value.slice(0, 20);
    clientOptions.value = await loadComboData('clientsCombo', false);
    docTypeOptions.value = await loadComboData('documentTypesCombo', false);
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar datos' });
  }
});
</script>

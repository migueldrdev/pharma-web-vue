<template>
  <q-page class="q-pa-md">
    <AppPageHeader title="Nueva Compra" subtitle="Registrar compra con lotes y vencimientos" />

    <div class="row q-col-gutter-md">
      <div class="col-md-8 col-xs-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-primary q-mb-md">Productos y Lotes</div>
            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-md-4 col-xs-12">
                <q-select v-model="currentProduct" :options="productOptions" label="Producto" outlined dense use-input input-debounce="300" @filter="filterProducts" emit-value map-options />
              </div>
              <div class="col-md-2 col-xs-6">
                <q-input v-model.number="currentQty" type="number" label="Cantidad" outlined dense min="1" />
              </div>
              <div class="col-md-2 col-xs-6">
                <q-input v-model.number="currentPrice" type="number" label="Precio" outlined dense min="0" prefix="S/" />
              </div>
              <div class="col-md-2 col-xs-6">
                <q-input v-model="currentBatch" label="N° Lote" outlined dense />
              </div>
              <div class="col-md-2 col-xs-6">
                <q-input v-model="currentExpiry" type="date" label="Vencimiento" outlined dense />
              </div>
            </div>
            <div class="row justify-end q-mb-md">
              <q-btn color="primary" icon="add" label="Agregar" @click="addItem" unelevated :disable="!currentProduct || currentQty < 1" />
            </div>

            <q-table v-if="cart.length > 0" :rows="cart" :columns="cartCols" row-key="product_id" dense flat hide-pagination>
              <template #body-cell-actions="props">
                <q-td :props="props"><q-btn icon="delete" size="sm" flat round color="negative" @click="cart.splice(props.rowIndex, 1)" /></q-td>
              </template>
            </q-table>

            <div v-else class="text-center text-grey q-py-lg"><q-icon name="inventory" size="3em" /><p>Agregue productos</p></div>
            <q-separator class="q-my-md" />
            <div class="row items-center justify-end"><div class="text-h6 text-green-8">Total: S/ {{ cartTotal.toFixed(2) }}</div></div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-md-4 col-xs-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-primary q-mb-md">Proveedor</div>
            <q-select v-model="form.supplier_id" :options="supplierOptions" label="Proveedor" outlined dense emit-value map-options class="q-mb-sm" />
            <q-select v-model="form.purchase_document_type_id" :options="docTypeOptions" label="Tipo documento" outlined dense emit-value map-options class="q-mb-sm" />
            <q-input v-model="form.document_number" label="N° Documento" outlined dense class="q-mb-md" />
            <q-btn color="primary" icon="shopping_cart" label="Registrar Compra" :loading="submitting" :disable="cart.length === 0 || !form.supplier_id" @click="submit" unelevated class="full-width" />
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
import { useFetchHttp, IHttpResourceOption } from '@composables/useFetchHttp';
import { useCombo } from '@composables/useCombo';
import type { IComboItem } from '@interfaces/IComboItem';

interface CartItem { product_id: number; name: string; quantity: number; price: number; subtotal: number; batch_number?: string; expiration_date?: string; }

const router = useRouter();
const { fetchHttpResource } = useFetchHttp();
const { loadComboData } = useCombo();
const $q = useQuasar();

const allProducts = ref<IComboItem[]>([]);
const productOptions = ref<IComboItem[]>([]);
const supplierOptions = ref<IComboItem[]>([]);
const docTypeOptions = ref<IComboItem[]>([]);

const currentProduct = ref<number | null>(null);
const currentQty = ref(1);
const currentPrice = ref(0);
const currentBatch = ref('');
const currentExpiry = ref('');
const cart = ref<CartItem[]>([]);
const submitting = ref(false);
const form = ref({ supplier_id: null as number | null, purchase_document_type_id: null as number | null, document_number: '' });

const cartCols = [
  { name: 'name', label: 'Producto', field: 'name', align: 'left' as const },
  { name: 'quantity', label: 'Cant.', field: 'quantity', align: 'center' as const },
  { name: 'price', label: 'Precio U.', field: (r: CartItem) => `S/ ${r.price.toFixed(2)}`, align: 'right' as const },
  { name: 'batch_number', label: 'Lote', field: 'batch_number', align: 'left' as const },
  { name: 'expiration_date', label: 'Vencimiento', field: 'expiration_date', align: 'left' as const },
  { name: 'actions', label: '', field: 'actions', align: 'center' as const },
];
const cartTotal = computed(() => cart.value.reduce((s, x) => s + x.subtotal, 0));

function filterProducts(val: string, update: (_fn: () => void) => void) {
  update(() => { productOptions.value = val ? allProducts.value.filter((p) => p.label.toLowerCase().includes(val.toLowerCase())) : allProducts.value.slice(0, 20); });
}

function addItem() {
  if (!currentProduct.value || currentQty.value < 1) return;
  const p = allProducts.value.find((x) => x.value === currentProduct.value);
  if (!p) return;
  const item: CartItem = {
    product_id: currentProduct.value,
    name: p.label,
    quantity: currentQty.value,
    price: currentPrice.value || 0,
    subtotal: currentQty.value * (currentPrice.value || 0),
    batch_number: currentBatch.value || undefined,
    expiration_date: currentExpiry.value || undefined,
  };
  cart.value.push(item);
  currentProduct.value = null; currentQty.value = 1; currentPrice.value = 0; currentBatch.value = ''; currentExpiry.value = '';
}

async function submit() {
  if (cart.value.length === 0 || !form.value.supplier_id) return;
  submitting.value = true;
  try {
    const response = await fetchHttpResource({
      ...resources.createPurchase(),
      data: {
        purchase_date: new Date().toISOString().split('T')[0],
        total: cartTotal.value,
        supplier_id: form.value.supplier_id,
        purchase_document_type_id: form.value.purchase_document_type_id,
        document_number: form.value.document_number || undefined,
        details: cart.value.map((i) => ({ product_id: i.product_id, quantity: i.quantity, price: i.price, subtotal: i.subtotal, batch_number: i.batch_number, expiration_date: i.expiration_date })),
      },
    } as IHttpResourceOption);
    if (response.success) { $q.notify({ type: 'positive', message: 'Compra registrada' }); void router.push({ name: 'purchases' }); }
    else { $q.notify({ type: 'negative', message: response.message || 'Error' }); }
  } catch { $q.notify({ type: 'negative', message: 'Error al registrar compra' }); }
  finally { submitting.value = false; }
}

onMounted(async () => {
  try {
    allProducts.value = await loadComboData('productsCombo', false);
    productOptions.value = allProducts.value.slice(0, 20);
    supplierOptions.value = await loadComboData('suppliersCombo', false);
    docTypeOptions.value = await loadComboData('purchaseDocumentTypesCombo', false);
  } catch { $q.notify({ type: 'negative', message: 'Error al cargar datos' }); }
});
</script>

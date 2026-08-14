import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useFetchHttp } from '@composables/useFetchHttp';
import { stockReservationResources } from '@/api-resources/stockReservationResource';
import type { IComboItem } from '@interfaces/IComboItem';

export interface ProductMeta {
  code: string | null;
  name: string;
  price: number;
  stock: number;
  min_stock: number;
  is_low_stock: boolean;
  expiration_date: string | null;
}

export interface CartItem {
  product_id: number;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  max_stock: number;
  reserved?: boolean;
}

/** Extrae el objeto `meta` de un combo item enriquecido */
function extractMeta(product: IComboItem): ProductMeta | null {
  const raw = (product as unknown as Record<string, unknown>).meta as
    | Record<string, unknown>
    | undefined;
  if (!raw) return null;
  return {
    code: typeof raw.code === 'string' ? raw.code : null,
    name: typeof raw.name === 'string' ? raw.name : String(product.label),
    price: Number(raw.price ?? 0),
    stock: Number(raw.stock ?? 0),
    min_stock: Number(raw.min_stock ?? 0),
    is_low_stock: Boolean(raw.is_low_stock),
    expiration_date: typeof raw.expiration_date === 'string' ? raw.expiration_date : null,
  };
}

export function usePosCart(allProducts: { value: IComboItem[] }) {
  const $q = useQuasar();
  const { fetchHttpResource } = useFetchHttp();
  const currentProduct = ref<number | null>(null);
  const currentQuantity = ref<number>(1);
  const currentPrice = ref<number>(0);
  const currentMaxStock = ref<number>(0);
  const cart = ref<CartItem[]>([]);
  const searchInput = ref<{ focus?: () => void } | null>(null);

  // ID de sesión único para reservas temporales de esta terminal POS
  const sessionId = ref<string>(
    localStorage.getItem('pos_session_id') || `pos-term-${Math.random().toString(36).substring(2, 9)}`,
  );
  localStorage.setItem('pos_session_id', sessionId.value);

  const cartTotal = computed(() => cart.value.reduce((sum, item) => sum + item.subtotal, 0));

  /** IDs de productos que ya están en el carrito (para filtrar del combo) */
  const cartProductIds = computed(() => new Set(cart.value.map((i) => i.product_id)));

  /** Verifica si un producto ya está en el carrito */
  function isProductInCart(productId: number): boolean {
    return cartProductIds.value.has(productId);
  }

  /** Retorna el stock disponible restante para un producto ya en el carrito */
  function getRemainingStock(item: CartItem): number {
    return Math.max(0, item.max_stock - item.quantity);
  }

  function onProductSelected(val: number) {
    // Bloquear si ya está en el carrito
    if (isProductInCart(val)) {
      $q.notify({
        type: 'warning',
        message: 'Este producto ya está en el carrito. Modifique la cantidad directamente en la tabla.',
        position: 'top-right',
        timeout: 3000,
      });
      currentProduct.value = null;
      return;
    }

    const product = allProducts.value.find((p) => p.value === val);
    if (product) {
      const meta = extractMeta(product);
      currentPrice.value = meta?.price ?? 0;
      currentMaxStock.value = meta?.stock ?? 0;

      // Si el stock es 0, bloquear inmediatamente
      if (currentMaxStock.value <= 0) {
        $q.notify({
          type: 'negative',
          message: `${meta?.name ?? 'Producto'} está agotado (Stock: 0). No se puede agregar al carrito.`,
          position: 'top-right',
          timeout: 3000,
        });
        currentProduct.value = null;
        currentQuantity.value = 1;
        return;
      }

      // Clampar la cantidad al stock máximo disponible
      currentQuantity.value = Math.min(1, currentMaxStock.value);
    }
  }

  async function reserveStockItem(productId: number, quantity: number): Promise<{ success: boolean; available?: number | undefined }> {
    try {
      const res = await fetchHttpResource(
        stockReservationResources.hold({
          product_id: productId,
          quantity,
          session_id: sessionId.value,
        }),
        false,
      );
      if (res.success) {
        return { success: true };
      }
      // El backend devolvió 422: stock insuficiente
      const resAny = res as unknown as Record<string, unknown>;
      const available = typeof resAny.available_stock === 'number' ? resAny.available_stock : undefined;
      return { success: false, available };
    } catch (err: unknown) {
      // Intentar extraer available_stock de la respuesta del error HTTP
      const errData = (err as Record<string, unknown>)?.response as Record<string, unknown> | undefined;
      const data = errData?.data as Record<string, unknown> | undefined;
      const available = typeof data?.available_stock === 'number' ? data.available_stock : undefined;
      return { success: false, available };
    }
  }

  async function releaseStockItem(productId: number) {
    try {
      await fetchHttpResource(
        stockReservationResources.release({
          product_id: productId,
          session_id: sessionId.value,
        }),
        false,
      );
    } catch {
      // Silencioso
    }
  }

  async function addProductToCart() {
    if (!currentProduct.value || currentQuantity.value < 1) return;

    // Prevenir duplicados
    if (isProductInCart(currentProduct.value)) {
      $q.notify({
        type: 'warning',
        message: 'Este producto ya está en el carrito. Modifique la cantidad en la tabla.',
        position: 'top-right',
        timeout: 3000,
      });
      resetSearch();
      return;
    }

    const product = allProducts.value.find((p) => p.value === currentProduct.value);
    if (!product) return;

    const meta = extractMeta(product);
    const maxStock = meta?.stock ?? 0;

    // Validar stock local antes de la llamada
    if (maxStock <= 0) {
      $q.notify({
        type: 'negative',
        message: `${meta?.name ?? 'Producto'} está agotado. No se puede agregar.`,
        position: 'top-right',
        timeout: 3000,
      });
      resetSearch();
      return;
    }

    // Clampar cantidad al stock disponible
    const clampedQty = Math.min(currentQuantity.value, maxStock);
    if (clampedQty < currentQuantity.value) {
      $q.notify({
        type: 'warning',
        message: `Cantidad ajustada a ${clampedQty} (stock máximo disponible).`,
        position: 'top-right',
        timeout: 3000,
      });
    }

    // Intentar reservar stock dinámico
    const holdResult = await reserveStockItem(currentProduct.value, clampedQty);
    if (!holdResult.success) {
      const avail = holdResult.available ?? 0;
      $q.notify({
        type: 'negative',
        message: `Stock insuficiente. Disponible en inventario real: ${avail} unidades.`,
        position: 'top-right',
        timeout: 4000,
      });
      // Si hay algo disponible, ajustar
      if (avail > 0 && avail < clampedQty) {
        currentQuantity.value = avail;
      }
      return;
    }

    const price = currentPrice.value || meta?.price || 0;

    cart.value.push({
      product_id: currentProduct.value,
      name: meta?.name ?? product.label,
      quantity: clampedQty,
      price,
      subtotal: clampedQty * price,
      max_stock: maxStock,
      reserved: true,
    });

    resetSearch();
  }

  async function updateItemQuantity(item: CartItem, delta: number) {
    const newQuantity = item.quantity + delta;

    // No permitir bajar de 1
    if (newQuantity < 1) return;

    // No permitir exceder stock máximo
    if (newQuantity > item.max_stock) {
      $q.notify({
        type: 'warning',
        message: `Stock máximo alcanzado (${item.max_stock} unid.). No se puede agregar más.`,
        position: 'top-right',
        timeout: 2500,
      });
      return;
    }

    // Intentar reservar con la nueva cantidad
    const holdResult = await reserveStockItem(item.product_id, newQuantity);
    if (!holdResult.success) {
      const avail = holdResult.available ?? item.max_stock;
      $q.notify({
        type: 'negative',
        message: `No se pudo reservar. Disponible: ${avail} unid.`,
        position: 'top-right',
        timeout: 3000,
      });
      return;
    }

    item.quantity = newQuantity;
    item.subtotal = item.quantity * item.price;
  }

  async function recalculateCart() {
    for (const item of cart.value) {
      if (!item.quantity || item.quantity < 1) item.quantity = 1;
      // Clampar al stock máximo
      if (item.quantity > item.max_stock) {
        item.quantity = item.max_stock;
        $q.notify({
          type: 'warning',
          message: `${item.name}: cantidad ajustada al stock máximo (${item.max_stock}).`,
          position: 'top-right',
          timeout: 2500,
        });
      }
      item.subtotal = item.quantity * item.price;
      await reserveStockItem(item.product_id, item.quantity);
    }
  }

  async function removeFromCart(item: CartItem) {
    await releaseStockItem(item.product_id);
    cart.value = cart.value.filter((i) => i.product_id !== item.product_id);
  }

  function resetSearch() {
    currentProduct.value = null;
    currentQuantity.value = 1;
    currentPrice.value = 0;
    currentMaxStock.value = 0;
    if (searchInput.value?.focus) {
      searchInput.value.focus();
    }
  }

  return {
    cart,
    cartTotal,
    cartProductIds,
    currentProduct,
    currentQuantity,
    currentPrice,
    currentMaxStock,
    searchInput,
    sessionId,
    isProductInCart,
    getRemainingStock,
    onProductSelected,
    addProductToCart,
    updateItemQuantity,
    recalculateCart,
    removeFromCart,
  };
}

import { ref, computed } from 'vue';
import { useFetchHttp } from '@composables/useFetchHttp';
import { stockReservationResources } from '@/api-resources/stockReservationResource';
import type { IComboItem } from '@interfaces/IComboItem';

export interface CartItem {
  product_id: number;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  reserved?: boolean;
}

export function usePosCart(allProducts: { value: IComboItem[] }) {
  const { fetchHttpResource } = useFetchHttp();
  const currentProduct = ref<number | null>(null);
  const currentQuantity = ref<number>(1);
  const currentPrice = ref<number>(0);
  const cart = ref<CartItem[]>([]);
  const searchInput = ref<{ focus?: () => void } | null>(null);

  // ID de sesión único para reservas temporales de esta terminal POS
  const sessionId = ref<string>(
    localStorage.getItem('pos_session_id') || `pos-term-${Math.random().toString(36).substring(2, 9)}`,
  );
  localStorage.setItem('pos_session_id', sessionId.value);

  const cartTotal = computed(() => cart.value.reduce((sum, item) => sum + item.subtotal, 0));

  function onProductSelected(val: number) {
    const product = allProducts.value.find((p) => p.value === val);
    if (product) {
      currentQuantity.value = 1;
      const meta = (product as unknown as Record<string, unknown>).meta as Record<string, unknown> | undefined;
      currentPrice.value = meta?.price ? Number(meta.price) : 0;
    }
  }

  async function reserveStockItem(productId: number, quantity: number) {
    try {
      const res = await fetchHttpResource(
        stockReservationResources.hold({
          product_id: productId,
          quantity,
          session_id: sessionId.value,
        }),
        false,
      );
      return res.success;
    } catch {
      return false;
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

    const product = allProducts.value.find((p) => p.value === currentProduct.value);
    if (!product) return;

    const existing = cart.value.find((item) => item.product_id === currentProduct.value);
    const newQty = existing ? existing.quantity + currentQuantity.value : currentQuantity.value;

    // Intentar reservar stock dinámico
    await reserveStockItem(currentProduct.value, newQty);

    if (existing) {
      existing.quantity = newQty;
      existing.subtotal = existing.quantity * existing.price;
      existing.reserved = true;
    } else {
      cart.value.push({
        product_id: currentProduct.value,
        name: product.label,
        quantity: currentQuantity.value,
        price: currentPrice.value || 0,
        subtotal: currentQuantity.value * (currentPrice.value || 0),
        reserved: true,
      });
    }

    resetSearch();
  }

  async function updateItemQuantity(item: CartItem, delta: number) {
    const newQuantity = item.quantity + delta;
    if (newQuantity >= 1) {
      item.quantity = newQuantity;
      item.subtotal = item.quantity * item.price;
      await reserveStockItem(item.product_id, item.quantity);
    }
  }

  async function recalculateCart() {
    for (const item of cart.value) {
      if (!item.quantity || item.quantity < 1) item.quantity = 1;
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
    if (searchInput.value?.focus) {
      searchInput.value.focus();
    }
  }

  return {
    cart,
    cartTotal,
    currentProduct,
    currentQuantity,
    currentPrice,
    searchInput,
    sessionId,
    onProductSelected,
    addProductToCart,
    updateItemQuantity,
    recalculateCart,
    removeFromCart,
  };
}

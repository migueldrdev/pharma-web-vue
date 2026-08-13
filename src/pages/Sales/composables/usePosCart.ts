import { ref, computed } from 'vue';
import type { IComboItem } from '@interfaces/IComboItem';

export interface CartItem {
  product_id: number;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export function usePosCart(allProducts: { value: IComboItem[] }) {
  const currentProduct = ref<number | null>(null);
  const currentQuantity = ref<number>(1);
  const currentPrice = ref<number>(0);
  const cart = ref<CartItem[]>([]);
  const searchInput = ref<{ focus?: () => void } | null>(null);

  const cartTotal = computed(() => cart.value.reduce((sum, item) => sum + item.subtotal, 0));

  function onProductSelected(val: number) {
    const product = allProducts.value.find((p) => p.value === val);
    if (product) {
      currentQuantity.value = 1;
      const meta = (product as unknown as Record<string, unknown>).meta as Record<string, unknown> | undefined;
      currentPrice.value = meta?.price ? Number(meta.price) : 0;
    }
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

    resetSearch();
  }

  function updateItemQuantity(item: CartItem, delta: number) {
    const newQuantity = item.quantity + delta;
    if (newQuantity >= 1) {
      item.quantity = newQuantity;
      item.subtotal = item.quantity * item.price;
    }
  }

  function recalculateCart() {
    cart.value.forEach((item) => {
      if (!item.quantity || item.quantity < 1) item.quantity = 1;
      item.subtotal = item.quantity * item.price;
    });
  }

  function removeFromCart(item: CartItem) {
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
    onProductSelected,
    addProductToCart,
    updateItemQuantity,
    recalculateCart,
    removeFromCart,
  };
}

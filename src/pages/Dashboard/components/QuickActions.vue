<script setup lang="ts">
import { useRouter } from 'vue-router';

defineOptions({ name: 'QuickActions' });

const router = useRouter();

interface Action {
  id: string;
  label: string;
  icon: string;
  color: string;
  route: string;
}

const actions: Action[] = [
  { id: 'new-sale', label: 'Nueva Venta', icon: 'point_of_sale', color: 'primary', route: '/sales/new' },
  { id: 'add-product', label: 'Agregar Producto', icon: 'add_shopping_cart', color: 'secondary', route: '/inventory/products' },
  { id: 'inventory', label: 'Ver Inventario', icon: 'inventory_2', color: 'accent', route: '/inventory/products' },
  { id: 'reports', label: 'Reportes', icon: 'assessment', color: 'positive', route: '/reports/sales' },
  { id: 'customers', label: 'Gestionar Clientes', icon: 'people', color: 'info', route: '/customers' },
  { id: 'settings', label: 'Configuración', icon: 'settings', color: 'grey-8', route: '/settings' },
];
</script>

<template>
  <q-card flat bordered>
    <q-card-section>
      <h3 class="text-subtitle2 q-ma-none q-mb-md">Acciones Rápidas</h3>
      <div class="row q-col-gutter-sm">
        <div v-for="action in actions" :key="action.id" class="col-6 col-sm-4 col-md-3 col-lg-2">
          <q-btn
            :icon="action.icon"
            :label="action.label"
            :color="action.color"
            unelevated
            no-caps
            class="full-width"
            @click="router.push(action.route)"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<template>
  <q-page class="q-pa-md">
    <AppPageHeader title="Centro de Ayuda" subtitle="Documentación, guía interactiva de teclado POS y soporte técnico" />
    
    <!-- Top Action Cards -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-md-3 col-sm-6 col-xs-12" v-for="item in items" :key="item.title">
        <q-card 
          flat 
          bordered 
          class="cursor-pointer pharma-card text-center" 
          @click="handleCardClick(item)"
        >
          <q-card-section>
            <q-icon :name="item.icon" size="48px" :color="item.color" class="q-mb-sm" />
            <div class="text-subtitle1 text-weight-bold">{{ item.title }}</div>
            <div class="text-caption text-muted">{{ item.desc }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
    
    <div class="row q-col-gutter-md">
      <!-- POS Keyboard Shortcuts Section -->
      <div class="col-md-6 col-xs-12">
        <q-card flat bordered class="pharma-card">
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div class="text-subtitle1 text-weight-bold text-primary">
                <q-icon name="keyboard" size="sm" class="q-mr-xs" /> Atajos de Teclado POS (Caja Rápida)
              </div>
              <q-btn 
                flat 
                dense 
                size="sm" 
                color="primary" 
                label="Ver Todos" 
                icon-right="open_in_new" 
                @click="showShortcutsModal = true" 
              />
            </div>

            <q-list separator dense class="rounded-borders">
              <q-item v-for="shortcut in posShortcuts.slice(0, 5)" :key="shortcut.key">
                <q-item-section avatar style="min-width: 100px;">
                  <span class="pos-kbd-badge">{{ shortcut.key }}</span>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ shortcut.action }}</q-item-label>
                  <q-item-label caption class="text-muted">{{ shortcut.desc }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- FAQ Section -->
      <div class="col-md-6 col-xs-12">
        <q-card flat bordered class="pharma-card">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold text-primary q-mb-md">
              <q-icon name="help_outline" size="sm" class="q-mr-xs" /> Preguntas Frecuentes
            </div>
            <q-list separator dense class="rounded-borders">
              <q-expansion-item 
                v-for="faq in faqs" 
                :key="faq.q" 
                :label="faq.q" 
                :caption="faq.a" 
                group="faq" 
                header-class="text-weight-medium" 
              />
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Modal Interactivo de Guía Completa de Teclado POS -->
    <q-dialog v-model="showShortcutsModal" backdrop-filter="blur(4px)">
      <q-card style="width: 600px; max-width: 95vw;" class="pharma-card">
        <q-toolbar class="bg-primary text-white">
          <q-icon name="keyboard" size="sm" class="q-mr-sm" />
          <q-toolbar-title class="text-weight-bold">Guía Completa de Atajos de Teclado POS</q-toolbar-title>
          <q-btn flat dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section class="q-pa-md">
          <div class="text-body2 text-muted q-mb-md">
            Optimiza el tiempo de atención en caja utilizando los atajos de teclado sin necesidad de usar el mouse.
          </div>

          <q-list separator dense>
            <q-item v-for="shortcut in posShortcuts" :key="shortcut.key" class="q-py-sm">
              <q-item-section avatar style="min-width: 120px;">
                <span class="pos-kbd-badge">{{ shortcut.key }}</span>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold text-primary">{{ shortcut.action }}</q-item-label>
                <q-item-label caption class="text-muted">{{ shortcut.desc }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cerrar" color="grey-7" v-close-popup />
          <q-btn 
            color="primary" 
            label="Ir al Punto de Venta (POS)" 
            icon="point_of_sale" 
            class="pharma-btn-main" 
            :to="{ path: '/sales/new' }" 
            v-close-popup 
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import AppPageHeader from '@components/shared/AppPageHeader.vue';

defineOptions({ name: 'HelpPage' });

const $q = useQuasar();
const showShortcutsModal = ref(false);

interface PosShortcut {
  key: string;
  action: string;
  desc: string;
}

const items = [
  { id: 'manual', title: 'Manual de Usuario', icon: 'menu_book', color: 'primary', desc: 'Guía completa del sistema' },
  { id: 'videos', title: 'Video Tutoriales', icon: 'play_circle', color: 'positive', desc: 'Aprende con videos paso a paso' },
  { id: 'pos_guide', title: 'Guía POS por Teclado', icon: 'keyboard', color: 'info', desc: 'Atajos para caja rápida' },
  { id: 'support', title: 'Soporte Técnico', icon: 'support_agent', color: 'warning', desc: 'Contacta a nuestro equipo' },
];

const posShortcuts: PosShortcut[] = [
  { key: 'Enter', action: 'Búsqueda / Agregar Producto', desc: 'Presiona Enter en la cantidad o en la búsqueda para agregar al carrito.' },
  { key: 'F2', action: 'Registrar Venta Directa', desc: 'Procesa y finaliza la venta actual en el comprobante seleccionado.' },
  { key: 'F4', action: 'Enfocar Buscador de Cliente', desc: 'Mueve el foco directamente al campo de selección de cliente o documento.' },
  { key: 'F8', action: 'Alternar Tipo de Comprobante', desc: 'Cambia rápidamente entre Boleta de Venta, Factura y Ticket.' },
  { key: 'Esc', action: 'Limpiar Carrito / Cancelar', desc: 'Vacía los productos del carrito o cierra los modales activos.' },
  { key: '+ / -', action: 'Aumentar / Reducir Cantidad', desc: 'Modifica la cantidad del ítem seleccionado en la lista del carrito.' },
  { key: 'Supr / Delete', action: 'Eliminar Ítem del Carrito', desc: 'Quita el producto enfocado del carrito de ventas.' },
];

const faqs = [
  { q: '¿Cómo registrar una venta rápida?', a: 'Ve al módulo de Ventas > Nueva Venta (POS), busca el producto por nombre o código de barras, presiona Enter para agregar y F2 para procesar la venta.' },
  { q: '¿Cómo agregar un nuevo producto al inventario?', a: 'Ve a Inventario > Productos, haz clic en Nuevo Producto y llena el formulario con el nombre, precio, stock y lote.' },
  { q: '¿Cómo ver productos próximos a vencer?', a: 'Ve a Inventario > Productos por Vencer para ver todos los lotes con fecha de caducidad cercana.' },
  { q: '¿Cómo funciona el sistema de lotes (FIFO)?', a: 'Al registrar una compra con número de lote, el sistema crea automáticamente el lote. Al vender, se descuenta primero del lote más próximo a vencer.' },
];

function handleCardClick(item: { id: string; title: string }) {
  if (item.id === 'pos_guide') {
    showShortcutsModal.value = true;
  } else {
    $q.notify({
      type: 'info',
      message: `${item.title} - Disponible en la versión en la nube`,
      position: 'top-right'
    });
  }
}
</script>

<style lang="scss" scoped>
.pos-kbd-badge {
  display: inline-block;
  padding: 4px 8px;
  font-family: monospace;
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--q-primary);
  background-color: var(--surface-base);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  text-align: center;
  white-space: nowrap;
}
</style>

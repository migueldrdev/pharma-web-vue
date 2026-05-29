<template>
  <q-page class="q-pa-md">
    <AppPageHeader title="Ayuda" subtitle="Centro de ayuda y documentación" />
    <div class="row q-col-gutter-md">
      <div class="col-md-4 col-sm-6 col-xs-12" v-for="item in items" :key="item.title">
        <q-card flat bordered class="cursor-pointer" @click="$q.notify({ type: 'info', message: item.title + ' - Próximamente' })">
          <q-card-section class="text-center">
            <q-icon :name="item.icon" size="48px" :color="item.color" class="q-mb-sm" />
            <div class="text-subtitle1">{{ item.title }}</div>
            <div class="text-caption text-grey">{{ item.desc }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
    <q-card flat bordered class="q-mt-md">
      <q-card-section>
        <div class="text-subtitle1 text-primary">Preguntas Frecuentes</div>
        <q-list separator dense>
          <q-expansion-item v-for="faq in faqs" :key="faq.q" :label="faq.q" :caption="faq.a" group="faq" />
        </q-list>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import AppPageHeader from '@components/shared/AppPageHeader.vue';
const $q = useQuasar();
void $q;
const items = [
  { title: 'Manual de Usuario', icon: 'menu_book', color: 'primary', desc: 'Guía completa del sistema' },
  { title: 'Video Tutoriales', icon: 'play_circle', color: 'positive', desc: 'Aprende con videos paso a paso' },
  { title: 'Soporte Técnico', icon: 'support_agent', color: 'warning', desc: 'Contacta a nuestro equipo' },
];
const faqs = [
  { q: '¿Cómo registrar una venta?', a: 'Ve al módulo de Ventas > Nueva Venta, selecciona los productos y cliente, y haz clic en Registrar Venta.' },
  { q: '¿Cómo agregar un nuevo producto?', a: 'Ve a Inventario > Productos, haz clic en Nuevo Producto y llena el formulario.' },
  { q: '¿Cómo ver productos próximos a vencer?', a: 'Ve a Inventario > Productos por Vencer para ver todos los lotes con fecha de vencimiento cercana.' },
  { q: '¿Cómo funciona el sistema de lotes?', a: 'Al registrar una compra con número de lote, el sistema crea automáticamente el lote. Al vender, se descuenta primero del lote más próximo a vencer (FIFO).' },
];
</script>

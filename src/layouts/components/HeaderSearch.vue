<script setup lang="ts">
defineOptions({ name: 'HeaderSearch' });

const model = defineModel<string>({ default: '' });
</script>

<template>
  <q-input
    v-model="model"
    placeholder="Buscar productos, clientes..."
    dense
    standout
    color="white"
    v-permission="'search'"
  >
    <template #prepend>
      <q-icon name="search" color="white" />
    </template>
    <template #append v-if="model">
      <q-icon name="close" @click="model = ''" class="cursor-pointer" color="white" />
    </template>
  </q-input>
</template>

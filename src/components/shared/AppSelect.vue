<template>
  <q-select
    v-model="model"
    :options="filteredOptions"
    :label="label"
    :loading="loading"
    :dense="dense"
    :outlined="outlined"
    :clearable="clearable"
    :multiple="multiple"
    :use-chips="useChips"
    :emit-value="emitValue"
    :map-options="mapOptions"
    :rules="rules"
    :disable="disable"
    use-input
    input-debounce="300"
    behavior="menu"
    class="app-select"
    @filter="filterFn"
  >
    <template v-if="$slots.prepend" #prepend>
      <slot name="prepend" />
    </template>
    <template v-if="$slots.option" #option="scope">
      <slot name="option" v-bind="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section>
            <q-item-label>{{ scope.opt.label }}</q-item-label>
            <q-item-label v-if="scope.opt.caption" caption>{{ scope.opt.caption }}</q-item-label>
          </q-item-section>
        </q-item>
      </slot>
    </template>
  </q-select>
</template>

<script setup lang="ts" generic="T = unknown">
import { ref, watch } from 'vue';
import type { ValidationRule } from 'quasar';
import type { IComboItem } from '@interfaces/IComboItem';

interface Props {
  options: IComboItem[];
  label?: string;
  loading?: boolean;
  dense?: boolean;
  outlined?: boolean;
  clearable?: boolean;
  multiple?: boolean;
  useChips?: boolean;
  emitValue?: boolean;
  mapOptions?: boolean;
  disable?: boolean;
  rules?: ValidationRule[];
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  loading: false,
  dense: true,
  outlined: true,
  clearable: true,
  multiple: false,
  useChips: false,
  emitValue: true,
  mapOptions: true,
  disable: false,
  rules: () => [],
});

const model = defineModel<T>();

const filteredOptions = ref<IComboItem[]>(props.options);

watch(
  () => props.options,
  (newOpts) => {
    filteredOptions.value = newOpts;
  },
  { immediate: true },
);

function filterFn(val: string, update: (fn: () => void) => void) {
  update(() => {
    if (!val) {
      filteredOptions.value = props.options;
      return;
    }
    const needle = val.toLowerCase();
    filteredOptions.value = props.options.filter((opt) =>
      opt.label.toLowerCase().includes(needle),
    );
  });
}
</script>

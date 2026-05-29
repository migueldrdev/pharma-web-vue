<script setup lang="ts" generic="TRow">
import type { QTableProps } from 'quasar';

const _emit = defineEmits<{
  'update:filter': [value: string];
  'row-click': [evt: Event, row: TRow, index: number];
}>();
void _emit;


<script setup lang="ts" generic="TRow">
import type { QTableProps } from 'quasar';

defineProps<{
  columns: QTableProps['columns'];
  rows: TRow[];
  loading?: boolean;
  filter?: string;
  title?: string;
  visibleColumns?: string[];
}>();

const _emit = defineEmits<{
  'update:filter': [value: string];
  'row-click': [evt: Event, row: TRow, index: number];
}>();
void _emit;


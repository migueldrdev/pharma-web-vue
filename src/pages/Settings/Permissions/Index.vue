<template>
  <q-page class="q-pa-md">
    <AppPageHeader title="Permisos" subtitle="Administración de roles y permisos" />

    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="row items-center q-mb-md">
          <div class="text-subtitle1 text-primary">Roles</div>
          <q-space />
          <q-btn label="Nuevo Rol" icon="add" color="primary" rounded dense @click="openRoleDialog(null)" />
        </div>
        <div class="row q-col-gutter-md">
          <q-card v-for="role in roles" :key="(role.id as string | number)" flat bordered class="col-md-4 col-sm-6 col-xs-12">
            <q-card-section>
              <div class="row items-center">
                <q-icon :name="getRoleIcon(role.name as string)" :color="getRoleColor(role.name as string)"
                  size="md" class="q-mr-sm" />
                <div class="col">
                  <div class="text-subtitle1">{{ role.name }}</div>
                  <div class="text-caption text-grey">{{ role.description }}</div>
                  <div class="text-caption text-grey">{{ role.users_count }} usuarios</div>
                </div>
                <q-btn flat round dense icon="more_vert" size="sm">
                  <q-menu>
                    <q-list dense>
                      <q-item clickable @click="openRoleDialog(role)">
                        <q-item-section avatar><q-icon name="edit" color="warning" /></q-item-section>
                        <q-item-section>Editar</q-item-section>
                      </q-item>
                      <q-item clickable @click="handleDeleteRole(role)">
                        <q-item-section avatar><q-icon name="delete" color="negative" /></q-item-section>
                        <q-item-section>Eliminar</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered>
      <q-card-section>
        <div class="text-subtitle1 text-primary q-mb-md">Matriz de Permisos</div>
        <q-table :rows="permissionMatrix" :columns="permColumns" row-key="key" flat dense
          :loading="loadingPerms" :rows-per-page-options="[0]">
          <template #body-cell="p">
            <q-td :props="p" :class="p.col.name === 'module' ? 'text-weight-medium' : ''">
              <q-icon v-if="p.col.name === 'module'" :name="p.row.icon" size="xs" class="q-mr-xs" />
              <template v-if="p.col.name !== 'module'">
                <q-icon :name="p.value ? 'check_circle' : 'remove_circle_outline'"
                  :color="p.value ? 'positive' : 'grey'" size="xs" />
              </template>
              <template v-else>{{ p.value }}</template>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Dialog Role -->
    <q-dialog v-model="showRoleDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ editingRole ? 'Editar' : 'Nuevo' }} Rol</div>
          <q-space />
          <q-btn flat round dense icon="close" @click="showRoleDialog = false" />
        </q-card-section>
        <q-card-section>
          <q-form ref="roleFormRef" @submit="saveRole">
            <q-input v-model="roleForm.name" label="Nombre *" outlined dense
              :rules="[required('Nombre')]" />
            <q-input v-model="roleForm.description" label="Descripción" outlined dense type="textarea" />
            <div class="row justify-end q-mt-md q-gutter-sm">
              <q-btn label="Cancelar" flat color="grey" rounded @click="showRoleDialog = false" />
              <q-btn :label="editingRole ? 'Actualizar' : 'Crear'" type="submit" color="primary" rounded
                :loading="savingRole" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppPageHeader from '@components/shared/AppPageHeader.vue'
import { useFetchHttp, type IHttpResourceOption } from '@composables/useFetchHttp'
import { useNotify } from '@composables/useNotify'
import { useDialog } from '@composables/useDialog'
import { useValidation } from '@composables/useValidation'
import { roleResources } from './api-resource/roleResource'

defineOptions({ name: 'SettingsPermissionsIndex' })

const { fetchHttpResource } = useFetchHttp()
const { success } = useNotify()
const { confirmDelete } = useDialog()
const { required } = useValidation()

const roles = ref<Record<string, unknown>[]>([])
const loadingPerms = ref<boolean>(true)
const permissionMatrix = ref<Record<string, unknown>[]>([])

const permColumns = [
  { name: 'module', label: 'Módulo', field: 'label', align: 'left' as const },
  { name: 'view', label: 'Ver', field: 'view', align: 'center' as const },
  { name: 'create', label: 'Crear', field: 'create', align: 'center' as const },
  { name: 'edit', label: 'Editar', field: 'edit', align: 'center' as const },
  { name: 'delete', label: 'Eliminar', field: 'delete', align: 'center' as const },
]

// Role form
const showRoleDialog = ref<boolean>(false)
const savingRole = ref<boolean>(false)
const editingRole = ref<Record<string, unknown> | null>(null)
const roleFormRef = ref<{ validate: () => Promise<boolean> } | null>(null)
const roleForm = ref({ name: '', description: '' })

function getRoleIcon(name: string): string {
  const map: Record<string, string> = {
    Administrador: 'admin_panel_settings',
    admin: 'admin_panel_settings',
    Cajero: 'point_of_sale',
    cashier: 'point_of_sale',
    'Almacén': 'inventory',
    stock_manager: 'inventory',
  }
  return map[name] ?? 'badge'
}

function getRoleColor(name: string): string {
  const map: Record<string, string> = {
    Administrador: 'primary',
    admin: 'primary',
    Cajero: 'positive',
    cashier: 'positive',
    'Almacén': 'warning',
    stock_manager: 'warning',
  }
  return map[name] ?? 'grey'
}

async function loadRoles(): Promise<void> {
  const res = await fetchHttpResource<Record<string, unknown>>(roleResources.list())
  if (res.success) {
    const data = res.data as Record<string, unknown>
    roles.value = Array.isArray(data)
      ? (data as unknown as Record<string, unknown>[])
      : ((data as Record<string, unknown>).data as Record<string, unknown>[]) ?? []
  }
}

async function loadPermissions(): Promise<void> {
  loadingPerms.value = true
  const res = await fetchHttpResource<Record<string, Record<string, unknown>>>(roleResources.permissions)
  if (res.success) {
    const perms = (res.data ?? {}) as Record<string, Record<string, unknown>>
    const matrix: Record<string, unknown>[] = []
    for (const [key, val] of Object.entries(perms)) {
      const actions = (val.actions ?? []) as string[]
      matrix.push({
        key,
        icon: 'settings',
        label: (val.module ?? key) as string,
        view: actions.includes('view'),
        create: actions.includes('create'),
        edit: actions.includes('edit'),
        delete: actions.includes('delete'),
      })
    }
    permissionMatrix.value = matrix
  }
  loadingPerms.value = false
}

function openRoleDialog(role: Record<string, unknown> | null): void {
  editingRole.value = role
  if (role) {
    roleForm.value = { name: role.name as string, description: role.description as string }
  } else {
    roleForm.value = { name: '', description: '' }
  }
  showRoleDialog.value = true
}

async function saveRole(): Promise<void> {
  const valid = await roleFormRef.value?.validate()
  if (!valid) return
  savingRole.value = true
  const payload = { name: roleForm.value.name, description: roleForm.value.description }
  const resource = editingRole.value
    ? roleResources.update(editingRole.value.id as number)
    : roleResources.create
  const res = await fetchHttpResource({ ...resource, data: payload } as IHttpResourceOption)
  savingRole.value = false
  if (res.success) {
    success(editingRole.value ? 'Rol actualizado' : 'Rol creado')
    showRoleDialog.value = false
    void loadRoles()
  }
}

async function handleDeleteRole(role: Record<string, unknown>): Promise<void> {
  const roleName = typeof role.name === 'string' ? role.name : ''
  const confirmed = await confirmDelete(`el rol "${roleName}"`)
  if (!confirmed) return
  const res = await fetchHttpResource(roleResources.delete(role.id as number))
  if (res.success) {
    success('Rol eliminado')
    void loadRoles()
  }
}

onMounted(() => {
  void loadRoles()
  void loadPermissions()
})
</script>

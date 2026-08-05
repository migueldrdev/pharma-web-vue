<template>
  <q-page class="q-pa-md">
    <AppPageHeader title="Usuarios" subtitle="Gestión de usuarios del sistema" />

    <q-card flat bordered>
      <q-card-section>
        <div class="row q-col-gutter-sm q-mb-md items-center">
          <div class="col-12 col-md-4">
            <q-input v-model="search" label="Buscar" outlined dense clearable debounce="400"
              @update:model-value="loadUsers">
              <template #prepend><q-icon name="search" /></template>
            </q-input>
          </div>
          <div class="col-12 col-md-3">
            <q-select v-model="roleFilter" label="Rol" :options="roleOptions" outlined dense clearable emit-value map-options
              @update:model-value="loadUsers" />
          </div>
          <q-space />
          <q-btn label="Nuevo Usuario" icon="add" color="primary" rounded @click="openCreateDialog" />
        </div>

        <q-table :rows="users" :columns="userCols" :loading="loading" row-key="id" flat dense
          :rows-per-page-options="[10, 15, 25, 50]">
          <template #body-cell-role_name="p">
            <q-td :props="p">
              <q-badge color="primary" :label="p.value" />
            </q-td>
          </template>
          <template #body-cell-active="p">
            <q-td :props="p">
              <q-chip :color="p.value ? 'positive' : 'negative'" text-color="white" size="sm"
                :label="p.value ? 'Activo' : 'Inactivo'" />
            </q-td>
          </template>
          <template #body-cell-actions="p">
            <q-td :props="p">
              <q-btn icon="edit" size="sm" flat round color="warning" dense @click="openEditDialog(p.row)">
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn icon="delete" size="sm" flat round color="negative" dense @click="handleDelete(p.row)">
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 450px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ isEditing ? 'Editar' : 'Nuevo' }} Usuario</div>
          <q-space />
          <q-btn flat round dense icon="close" @click="showDialog = false" />
        </q-card-section>
        <q-card-section>
          <q-form ref="formRef" @submit="onSubmit">
            <q-input v-model="form.name" label="Nombre *" outlined dense
              :rules="[required('Nombre')]" />
            <q-input v-model="form.email" label="Email *" outlined dense type="email"
              :rules="[required('Email'), emailRule]" />
            <q-input v-model="form.password" label="Contraseña" outlined dense
              :type="isPwd ? 'password' : 'text'"
              :rules="isEditing ? [passwordRule] : [required('Contraseña'), passwordRule]">
              <template #append>
                <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                  @click="isPwd = !isPwd" />
              </template>
            </q-input>
            <q-select v-model="form.role_id" label="Rol *" :options="roleOptions" outlined dense
              emit-value map-options :rules="[required('Rol')]" />
            <div class="row justify-end q-mt-md q-gutter-sm">
              <q-btn label="Cancelar" flat color="grey" rounded @click="showDialog = false" />
              <q-btn :label="isEditing ? 'Actualizar' : 'Crear'" type="submit" color="primary" rounded
                :loading="saving" />
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
import { userResources } from './api-resource/userResource'
import { roleResources } from '@/pages/Settings/Permissions/api-resource/roleResource'

defineOptions({ name: 'SettingsUsersIndex' })

const { fetchHttpResource } = useFetchHttp()
const { success } = useNotify()
const { confirmDelete } = useDialog()
const { required, email: emailRule, password: passwordRule } = useValidation()

type UserRow = Record<string, unknown>

const users = ref<UserRow[]>([])
const loading = ref<boolean>(false)
const search = ref<string>('')
const roleFilter = ref<number | null>(null)
const roleOptions = ref<{ label: string; value: number }[]>([])

const userCols = [
  { name: 'name', label: 'Nombre', field: 'name', align: 'left' as const, sortable: true },
  { name: 'email', label: 'Email', field: 'email', align: 'left' as const },
  { name: 'role_name', label: 'Rol', field: (row: UserRow) => (row.role as UserRow)?.name ?? '-', align: 'left' as const },
  { name: 'active', label: 'Estado', field: 'active', align: 'center' as const },
  { name: 'actions', label: '', field: 'id', align: 'center' as const, style: 'width: 80px' },
]

const showDialog = ref<boolean>(false)
const isEditing = ref<boolean>(false)
const saving = ref<boolean>(false)
const isPwd = ref<boolean>(true)
const editingId = ref<number | null>(null)
const formRef = ref<{ validate: () => Promise<boolean> } | null>(null)
const form = ref({ name: '', email: '', password: '', role_id: null as number | null })

async function loadUsers(): Promise<void> {
  loading.value = true
  const params: Record<string, unknown> = {}
  if (search.value) params.search = search.value
  if (roleFilter.value) params.role_id = roleFilter.value
  const res = await fetchHttpResource<Record<string, unknown>>(userResources.list(params))
  if (res.success) {
    const data = res.data as Record<string, unknown>
    users.value = Array.isArray(data) ? (data as unknown as UserRow[]) : ((data as Record<string, unknown>).data as UserRow[]) ?? []
  }
  loading.value = false
}

async function loadRoles(): Promise<void> {
  const res = await fetchHttpResource<{ label: string; value: number }[]>(roleResources.combo)
  if (res.success) roleOptions.value = (res.data as { label: string; value: number }[]) ?? []
}

function openCreateDialog(): void {
  isEditing.value = false
  editingId.value = null
  form.value = { name: '', email: '', password: '', role_id: null }
  showDialog.value = true
}

function openEditDialog(row: UserRow): void {
  isEditing.value = true
  editingId.value = row.id as number
  form.value = {
    name: row.name as string,
    email: row.email as string,
    password: '',
    role_id: (row.role_id as number) ?? null,
  }
  showDialog.value = true
}

async function onSubmit(): Promise<void> {
  const valid = await formRef.value?.validate()
  if (!valid) return
  saving.value = true
  const payload: Record<string, unknown> = {
    name: form.value.name,
    email: form.value.email,
    role_id: form.value.role_id,
  }
  if (form.value.password) payload.password = form.value.password

  const resource = isEditing.value
    ? userResources.update(editingId.value!)
    : userResources.create as IHttpResourceOption

  const res = await fetchHttpResource({ ...resource, data: payload } as IHttpResourceOption)
  saving.value = false
  if (res.success) {
    success(isEditing.value ? 'Usuario actualizado' : 'Usuario creado')
    showDialog.value = false
    void loadUsers()
  }
}

async function handleDelete(row: UserRow): Promise<void> {
  const userName = typeof row.name === 'string' ? row.name : ''
  const confirmed = await confirmDelete(`el usuario "${userName}"`)
  if (!confirmed) return
  const res = await fetchHttpResource(userResources.delete(row.id as number))
  if (res.success) {
    success('Usuario eliminado')
    void loadUsers()
  }
}

onMounted(() => {
  void loadUsers()
  void loadRoles()
})
</script>

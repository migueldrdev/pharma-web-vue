import { ref, watch, nextTick } from 'vue';
import { Notify } from 'quasar';
import { useFetchHttp } from '@composables/useFetchHttp';
import { productResources } from '../api-resource/productResource';
import type { IProduct, IProductFormData } from '../interfaces/IProduct';

export function useProductForm() {
  const { fetchHttpResource } = useFetchHttp();

  const saving = ref(false);
  const imagePreview = ref('');
  const imageFile = ref<File | null>(null);

  const defaultForm = (): IProductFormData => ({
    name: '', code: '', category_id: null, lab_id: null, type_id: null,
    presentation_id: null, stock: 0, price: 0, min_stock: 5, image: '',
    pharmaceutical_form: '', description: '', batch: '', expiration_date: '',
    manufacturing_date: '', concentration: '', storage_condition_id: null,
    status: 'active', requires_prescription: false, is_controlled: false,
  });

  const form = ref<IProductFormData>(defaultForm());

  function populateFromProduct(product: IProduct) {
    form.value = {
      name: product.name,
      code: product.code,
      category_id: product.category_id,
      lab_id: product.lab_id,
      type_id: product.type_id,
      presentation_id: product.presentation_id,
      stock: product.stock,
      price: product.price,
      min_stock: product.min_stock,
      image: product.image ?? '',
      pharmaceutical_form: product.pharmaceutical_form,
      description: product.description ?? '',
      batch: product.batch ?? '',
      expiration_date: product.expiration_date ?? '',
      manufacturing_date: product.manufacturing_date ?? '',
      concentration: product.concentration ?? '',
      storage_condition_id: product.storage_condition_id,
      status: product.status,
      requires_prescription: product.requires_prescription,
      is_controlled: product.is_controlled,
    };
    imagePreview.value = '';
    imageFile.value = null;
  }

  function resetForm() {
    form.value = defaultForm();
    imagePreview.value = '';
    imageFile.value = null;
  }

  function generateCode() {
    const ts = Date.now().toString().slice(-6);
    const rnd = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    form.value.code = `PRD${ts}${rnd}`;
  }

  function setImageFile(file: File) {
    if (!file.type.startsWith('image/')) {
      Notify.create({ type: 'negative', message: 'Selecciona un archivo de imagen válido' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      Notify.create({ type: 'negative', message: 'La imagen no debe superar los 5MB' });
      return;
    }
    imageFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => { imagePreview.value = (e.target?.result as string) ?? ''; };
    reader.readAsDataURL(file);
  }

  function removeImage() {
    form.value.image = '';
    imagePreview.value = '';
    imageFile.value = null;
  }

  async function save(isEdit: boolean, productId?: number) {
    saving.value = true;
    try {
      const fd = new FormData();
      const entries = Object.entries(form.value) as [string, string | number | boolean | null][];

      for (const [key, value] of entries) {
        if (value === null || value === undefined) continue;
        if (key === 'image') continue;
        if (key === 'requires_prescription' || key === 'is_controlled') {
          fd.append(key, value ? '1' : '0');
        } else {
          fd.append(key, String(value));
        }
      }

      if (imageFile.value) {
        fd.append('image', imageFile.value, imageFile.value.name);
      }

      if (isEdit && productId) {
        fd.append('_method', 'PUT');
        const resource = { ...productResources.update(productId), data: fd };
        await fetchHttpResource(resource);
        Notify.create({ type: 'positive', message: 'Producto actualizado' });
      } else {
        const resource = { ...productResources.create, data: fd };
        await fetchHttpResource(resource);
        Notify.create({ type: 'positive', message: 'Producto creado' });
      }

      return true;
    } catch {
      Notify.create({ type: 'negative', message: isEdit ? 'Error al actualizar' : 'Error al crear' });
      return false;
    } finally {
      saving.value = false;
    }
  }

  return {
    form, saving, imagePreview,
    populateFromProduct, resetForm, generateCode,
    setImageFile, removeImage, save,
  };
}

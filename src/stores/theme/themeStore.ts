import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { Dark, setCssVar } from 'quasar';

export const useThemeStore = defineStore('theme', () => {
  // Estado
  const isDark = ref(Dark.isActive);
  const primaryColor = ref('#00B4A6');
  const activePresetId = ref('teal');

  // Paletas Preconfiguradas
  const presets = [
    { id: 'teal', name: 'Teal Salud', color: '#00B4A6' },
    { id: 'blue', name: 'Azul Océano', color: '#1890FF' },
    { id: 'green', name: 'Verde Esmeralda', color: '#52C41A' },
    { id: 'purple', name: 'Púrpura Real', color: '#722ED1' },
    { id: 'red', name: 'Carmesí', color: '#F5222D' },
    { id: 'amber', name: 'Ámbar', color: '#FA8C16' },
  ];

  // Cargar de localStorage
  const loadTheme = () => {
    const savedTheme = localStorage.getItem('pharma-theme');
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        isDark.value = parsed.isDark;
        primaryColor.value = parsed.primaryColor;
        activePresetId.value = parsed.activePresetId;
      } catch (e) {
        console.error('Error loading theme from localStorage', e);
      }
    }
    applyTheme();
  };

  // Guardar en localStorage
  const saveTheme = () => {
    localStorage.setItem('pharma-theme', JSON.stringify({
      isDark: isDark.value,
      primaryColor: primaryColor.value,
      activePresetId: activePresetId.value,
    }));
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1] as string, 16)}, ${parseInt(result[2] as string, 16)}, ${parseInt(result[3] as string, 16)}` : '0, 180, 166';
  };

  // Aplicar tema (Quasar Dark y primary color)
  const applyTheme = () => {
    Dark.set(isDark.value);
    setCssVar('primary', primaryColor.value);
    
    // Actualizar variables CSS root
    const rgb = hexToRgb(primaryColor.value);
    document.documentElement.style.setProperty('--q-primary', primaryColor.value);
    // Establecemos el color en la clase root para forzar actualización
    document.documentElement.style.setProperty('--border-focus', `rgba(${rgb}, 0.5)`);
    if(isDark.value){
       document.documentElement.style.setProperty('--border-focus', `rgba(${rgb}, 0.7)`);
    }

    saveTheme();
  };

  const toggleDarkMode = () => {
    isDark.value = !isDark.value;
    applyTheme();
  };

  const setPreset = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      activePresetId.value = preset.id;
      primaryColor.value = preset.color;
      applyTheme();
    }
  };

  const setCustomPrimaryColor = (color: string) => {
    activePresetId.value = 'custom';
    primaryColor.value = color;
    applyTheme();
  };

  watch([isDark, primaryColor, activePresetId], () => {
    applyTheme();
  });

  return {
    isDark,
    primaryColor,
    activePresetId,
    presets,
    loadTheme,
    toggleDarkMode,
    setPreset,
    setCustomPrimaryColor,
    applyTheme
  };
});

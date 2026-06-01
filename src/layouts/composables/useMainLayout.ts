import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Dark, Notify } from 'quasar';
import type { ILayoutBreadcrumb } from '../interfaces/ILayout';
import type { IMenuItem } from '@/interfaces/IMenuItem';
import { defaultMenuItems } from '../data/menuItems';

export function useMainLayout() {
  const router = useRouter();
  const route = useRoute();

  const leftDrawerOpen = ref(false);
  const miniState = ref(false);
  const menuItems = ref<IMenuItem[]>([...defaultMenuItems]);

  function toggleLeftDrawer() {
    leftDrawerOpen.value = !leftDrawerOpen.value;
  }

  function toggleMini() {
    miniState.value = !miniState.value;
  }

  function expandMini() {
    miniState.value = false;
  }

  function toggleTheme() {
    Dark.toggle();
    localStorage.setItem('theme', Dark.isActive ? 'dark' : 'light');
    Notify.create({
      message: `Tema ${Dark.isActive ? 'oscuro' : 'claro'} activado`,
      icon: Dark.isActive ? 'dark_mode' : 'light_mode',
      position: 'top-right',
      timeout: 2000,
    });
  }

  function navigateTo(path: string) {
    return router.push(path);
  }

  function isActiveParent(item: IMenuItem): boolean {
    if (!item.children) return false;
    return item.children.some((child) => child.route === route.path);
  }

  const breadcrumbs = computed<ILayoutBreadcrumb[]>(() => {
    const path = route.path;
    const crumbs: ILayoutBreadcrumb[] = [];

    if (path === '/') {
      crumbs.push({ label: 'Dashboard', icon: 'dashboard' });
      return crumbs;
    }

    const segments = path.split('/').filter(Boolean);
    let currentPath = '';

    const findMenuItem = (r: string): IMenuItem | undefined => {
      const find = (items: IMenuItem[]): IMenuItem | undefined => {
        for (const item of items) {
          if (item.route === r) return item;
          if (item.children) {
            const found = find(item.children);
            if (found) return found;
          }
        }
        return undefined;
      };
      return find(menuItems.value);
    };

    segments.forEach((_s, i) => {
      currentPath += `/${segments[i]}`;
      const menuItem = findMenuItem(currentPath);
      if (menuItem) {
        crumbs.push({
          label: menuItem.label,
          icon: menuItem.icon,
          ...(i < segments.length - 1 ? { to: currentPath } : {}),
        });
      }
    });

    return crumbs;
  });

  return {
    leftDrawerOpen,
    miniState,
    menuItems,
    breadcrumbs,
    toggleLeftDrawer,
    toggleMini,
    expandMini,
    toggleTheme,
    navigateTo,
    isActiveParent,
  };
}

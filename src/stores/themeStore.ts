import { ref } from 'vue';

const STORAGE_KEY = 'caldwell-theme';
const theme = ref(localStorage.getItem(STORAGE_KEY) || 'light');

const applyTheme = () => {
  document.documentElement.dataset.theme = theme.value;
  localStorage.setItem(STORAGE_KEY, theme.value);
};

export function useThemeStore() {
  const setTheme = (nextTheme: string) => {
    theme.value = nextTheme === 'dark' ? 'dark' : 'light';
    applyTheme();
  };

  const toggleTheme = () => {
    setTheme(theme.value === 'dark' ? 'light' : 'dark');
  };

  return {
    theme,
    applyTheme,
    setTheme,
    toggleTheme,
  };
}

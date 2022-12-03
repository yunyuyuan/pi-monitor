export const getHttpPrefix = () => {
  return `${window.location.protocol}//${import.meta.env.VITE_BACK_URL || window.location.host}`;
};

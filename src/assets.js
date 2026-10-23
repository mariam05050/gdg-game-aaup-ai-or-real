// Pair and branding paths are relative to public/, never to the current view.
export function assetUrl(path) {
  return `${import.meta.env.BASE_URL}${path}`;
}

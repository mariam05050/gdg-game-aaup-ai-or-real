// Resolve every path at the Vite base and fully decode all ten images before Start.
export async function preloadImages(paths, { resolveUrl, createImage = () => new Image(), timeoutMs = 15000 }) {
  const entries = await Promise.all(paths.map(path => new Promise((resolve, reject) => {
    const image = createImage();
    const timeout = setTimeout(() => reject(new Error('Image preparation timed out.')), timeoutMs);
    image.src = resolveUrl(path);
    image.decode().then(() => {
      if (!image.naturalWidth || !image.naturalHeight) throw new Error('Image has no dimensions.');
      resolve([path, image]);
    }).catch(reject).finally(() => clearTimeout(timeout));
  })));
  return new Map(entries);
}

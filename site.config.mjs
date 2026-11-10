const basePathToken = '__ANYROADMAP_BASE_PATH__';

const normalizeBasePath = value => {
  const path = String(value || '/').trim();
  return `/${path.replace(/^\/+|\/+$/g, '')}/`.replace(/^\/\/$/, '/');
};

const productionBasePath = normalizeBasePath(process.env.BASE_PATH || '/roadmap/');

const applyBasePath = (html, basePath) => {
  if (!html.includes(basePathToken)) return html;
  return html.replaceAll(basePathToken, normalizeBasePath(basePath));
};

export { applyBasePath, basePathToken, normalizeBasePath, productionBasePath };

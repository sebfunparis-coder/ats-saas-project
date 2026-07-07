/**
 * Intégration CMS headless (T-300) — Contentful Free Tier
 *
 * Configuration requise dans .env :
 *   VITE_CONTENTFUL_SPACE_ID   — ID du Space Contentful
 *   VITE_CONTENTFUL_ACCESS_TOKEN — Token d'accès (Content Delivery API)
 *
 * Setup Contentful (gratuit jusqu'à 25 000 entrées) :
 *   1. Créer un compte sur contentful.com
 *   2. Créer un Space
 *   3. Créer un Content Type "Blog Post" avec les champs :
 *      - title (Text), slug (Text, unique), excerpt (Text), body (Rich Text)
 *      - category (Text), author (Text), readTime (Integer), tags (Array)
 *      - coverImage (Media), publishedAt (Date)
 *   4. Ajouter les credentials dans .env
 *
 * Sans credentials : retourne les articles hardcodés existants (fallback).
 */

const SPACE_ID = import.meta.env.VITE_CONTENTFUL_SPACE_ID;
const ACCESS_TOKEN = import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN;
const BASE_URL = SPACE_ID ? `https://cdn.contentful.com/spaces/${SPACE_ID}/environments/master` : null;

const isCmsEnabled = () => !!(SPACE_ID && ACCESS_TOKEN);

async function fetchContentful(endpoint, params = {}) {
  if (!isCmsEnabled()) return null;
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('access_token', ACCESS_TOKEN);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Contentful API error ${res.status}`);
  return res.json();
}

/**
 * Transforme une entrée Contentful en objet article unifié.
 * Compatible avec le format attendu par BlogPage.jsx.
 */
function mapEntry(entry) {
  const f = entry.fields;
  return {
    id: entry.sys.id,
    slug: f.slug || entry.sys.id,
    title: f.title || '',
    excerpt: f.excerpt || '',
    category: f.category || 'Recrutement',
    author: f.author || 'Équipe ATS Ultimate',
    readTime: f.readTime || 5,
    date: f.publishedAt || entry.sys.createdAt?.slice(0, 10),
    tags: f.tags || [],
    image: f.coverImage?.fields?.file?.url
      ? `https:${f.coverImage.fields.file.url}` : null,
    body: f.body || null, // Rich Text — doit être rendu via @contentful/rich-text-react-renderer
    fromCms: true,
  };
}

/**
 * Récupère la liste des articles publiés.
 * @param {object} options — { limit, category, tag }
 * @returns {Promise<Array|null>} — null si CMS non configuré → fallback hardcodé
 */
export async function fetchBlogPosts({ limit = 50, category = null, tag = null } = {}) {
  if (!isCmsEnabled()) return null;
  try {
    const params = { content_type: 'blogPost', order: '-fields.publishedAt', limit };
    if (category) params['fields.category'] = category;
    if (tag) params['fields.tags[in]'] = tag;
    const data = await fetchContentful('/entries', params);
    return data?.items?.map(mapEntry) || [];
  } catch (err) {
    console.warn('Contentful fetch failed, using hardcoded fallback:', err.message);
    return null;
  }
}

/**
 * Récupère un article par son slug.
 * @param {string} slug
 * @returns {Promise<object|null>}
 */
export async function fetchBlogPost(slug) {
  if (!isCmsEnabled()) return null;
  try {
    const data = await fetchContentful('/entries', { content_type: 'blogPost', 'fields.slug': slug, limit: 1 });
    const item = data?.items?.[0];
    return item ? mapEntry(item) : null;
  } catch (err) {
    console.warn('Contentful single post fetch failed:', err.message);
    return null;
  }
}

export const contentfulEnabled = isCmsEnabled;

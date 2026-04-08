import { useState, useEffect, useCallback } from 'react';

export interface NewsArticle {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  sourceColor: string;
  category: string;
  author?: string;
  thumbnail?: string;
}

// Free RSS → JSON proxy (no key required)
const RSS2JSON = 'https://api.rss2json.com/v1/api.json?rss_url=';

const NEWS_SOURCES = [
  {
    name: 'BBC World',
    color: '#bb1919',
    category: 'GLOBAL',
    url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
  },
  {
    name: 'Reuters',
    color: '#ff8000',
    category: 'GEOPOLITICS',
    url: 'https://feeds.reuters.com/reuters/worldNews',
  },
  {
    name: 'Al Jazeera',
    color: '#009688',
    category: 'MENA',
    url: 'https://www.aljazeera.com/xml/rss/all.xml',
  },
  {
    name: 'AP News',
    color: '#e63946',
    category: 'BREAKING',
    url: 'https://rsshub.app/apnews/topics/world-news',
  },
  {
    name: 'The Guardian',
    color: '#0d5c9e',
    category: 'ANALYSIS',
    url: 'https://www.theguardian.com/world/rss',
  },
  {
    name: 'Sky News',
    color: '#006eaf',
    category: 'BREAKING',
    url: 'https://feeds.skynews.com/feeds/rss/world.xml',
  },
  {
    name: 'NASA',
    color: '#fc3d21',
    category: 'SPACE',
    url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss',
  },
  {
    name: 'Bellingcat',
    color: '#a855f7',
    category: 'OSINT',
    url: 'https://www.bellingcat.com/feed/',
  },
];

const PROXY = 'https://api.allorigins.win/raw?url=';

async function fetchFeed(source: typeof NEWS_SOURCES[0]): Promise<NewsArticle[]> {
  try {
    // Try rss2json first
    const r2jUrl = `${RSS2JSON}${encodeURIComponent(source.url)}`;
    const res = await fetch(r2jUrl, { signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'ok' && Array.isArray(data.items) && data.items.length > 0) {
        return data.items.slice(0, 8).map((item: any) => ({
          title: item.title || 'Untitled',
          description: item.description?.replace(/<[^>]+>/g, '').slice(0, 180) || '',
          link: item.link || '#',
          pubDate: item.pubDate || new Date().toISOString(),
          source: source.name,
          sourceColor: source.color,
          category: source.category,
          author: item.author || '',
          thumbnail: item.thumbnail || item.enclosure?.link || '',
        }));
      }
    }

    // Fallback: allorigins proxy + manual XML parse
    const proxyUrl = `${PROXY}${encodeURIComponent(source.url)}`;
    const res2 = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
    if (!res2.ok) return [];
    const text = await res2.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/xml');
    const items = Array.from(doc.querySelectorAll('item')).slice(0, 8);
    return items.map(item => ({
      title: item.querySelector('title')?.textContent || 'Untitled',
      description: (item.querySelector('description')?.textContent || '').replace(/<[^>]+>/g, '').slice(0, 180),
      link: item.querySelector('link')?.textContent || '#',
      pubDate: item.querySelector('pubDate')?.textContent || new Date().toISOString(),
      source: source.name,
      sourceColor: source.color,
      category: source.category,
      author: item.querySelector('author')?.textContent || '',
      thumbnail: '',
    }));
  } catch {
    return [];
  }
}

export function useNews() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled(NEWS_SOURCES.map(fetchFeed));
      const all: NewsArticle[] = [];
      results.forEach(r => {
        if (r.status === 'fulfilled') all.push(...r.value);
      });
      // Sort by date, newest first
      all.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
      setArticles(all);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    // Refresh every 5 minutes
    const interval = setInterval(fetchAll, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const categories = ['ALL', ...Array.from(new Set(NEWS_SOURCES.map(s => s.category)))];

  const filtered = activeFilter === 'ALL'
    ? articles
    : articles.filter(a => a.category === activeFilter);

  return { articles: filtered, loading, lastUpdated, activeFilter, setActiveFilter, categories, refresh: fetchAll };
}

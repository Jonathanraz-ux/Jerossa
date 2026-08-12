import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../services/catalog';
import { useCurrency } from '../context/CurrencyContext';
import { Search, ArrowRight, Star, SlidersHorizontal, X, BadgeCheck } from 'lucide-react';
import './animations.css';

const Catalogue = () => {
  const [searchParams] = useSearchParams();
  const { convert } = useCurrency();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    fetchProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
  }, [searchParams]);

  const filteredProducts = products.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.seller.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === 'all' || p.type === selectedCategory;
    return matchSearch && matchCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.priceEUR - b.priceEUR;
    if (sortBy === 'price-desc') return b.priceEUR - a.priceEUR;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  const typeFilters = [
    { value: 'all', label: 'Tous' },
    { value: 'vanilla', label: 'Vanille' },
    { value: 'cacao', label: 'Cacao' },
    { value: 'oil', label: 'Huiles' },
    { value: 'spices', label: 'Épices' },
    { value: 'coffee', label: 'Café' },
  ];

  const currentFilter = typeFilters.find(f => f.value === selectedCategory);

  return (
    <div className="catalogue-page">
      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <nav className="breadcrumb">
            <Link to="/">Accueil</Link>
            <span className="breadcrumb-sep">/</span>
            <span>Catalogue</span>
          </nav>
          <span className="page-header-tag">Marketplace Produits</span>
          <h1 className="page-header-title">Nos produits</h1>
          <p className="page-header-desc">Produits authentiques et matières premières d'exception, directement des producteurs et fournisseurs</p>
        </div>
      </section>

      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        {/* Search & Filters */}
        <div className="catalog-toolbar">
          <div className="catalog-search">
            <Search size={16} strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Rechercher un produit, un producteur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="catalog-search-clear" onClick={() => setSearchQuery('')}>
                <X size={14} />
              </button>
            )}
          </div>

          <div className="catalog-filter-chips">
            {typeFilters.map(type => (
              <button
                key={type.value}
                className={`filter-chip ${selectedCategory === type.value ? 'filter-chip--active' : ''}`}
                onClick={() => setSelectedCategory(type.value)}
              >
                {type.label}
              </button>
            ))}
          </div>

          <div className="catalog-sort">
            <label htmlFor="sort-select">Trier par</label>
            <select id="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Nouveautés</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="rating">Meilleures notes</option>
            </select>
          </div>

          <button className="catalog-mobile-filter-btn" onClick={() => setShowMobileFilters(!showMobileFilters)}>
            <SlidersHorizontal size={16} />
            Filtres
          </button>
        </div>

        {/* Results info */}
        <div className="catalog-results-info">
          <span>{sortedProducts.length} produit{sortedProducts.length > 1 ? 's' : ''} trouvé{sortedProducts.length > 1 ? 's' : ''}</span>
          {selectedCategory !== 'all' && (
            <span> dans <strong>{currentFilter?.label}</strong></span>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="catalog-empty">
            <div className="catalog-empty-icon">
              <Search size={28} />
            </div>
            <h3>Chargement…</h3>
            <p>Récupération des produits.</p>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="catalog-empty">
            <div className="catalog-empty-icon">
              <Search size={28} />
            </div>
            <h3>Aucun résultat</h3>
            <p>Essayez avec d'autres mots-clés ou modifiez vos filtres.</p>
            <button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} className="btn btn-outline">
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="catalog-grid">
            {sortedProducts.map((prod) => (
              <Link key={prod.id} to={`/product/${prod.id}`} className="catalog-product-card">
                <div className="catalog-product-image">
                  <img src={prod.images[0]} alt={prod.title} loading="lazy" />
                  {prod.tag && <span className="catalog-product-badge">{prod.tag}</span>}
                  <span className="catalog-product-type">{prod.type}</span>
                </div>
                <div className="catalog-product-body">
                  <span className="catalog-product-seller">{prod.seller}{prod.verified && <em className="catalog-verified"><BadgeCheck size={12} /> vérifié</em>}</span>
                  <h3 className="catalog-product-name">{prod.title}</h3>
                  <div className="catalog-product-rating">
                    <div className="stars">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} size={13} fill={j < Math.floor(prod.rating) ? "#d4a373" : "rgba(212,163,115,0.25)"} color="#d4a373" />
                      ))}
                    </div>
                    <span>({prod.reviews})</span>
                  </div>
                  <div className="catalog-product-footer">
                    <span className="catalog-product-price">
                      {convert(prod.priceEUR)}
                      <em className="catalog-product-unit">/ {prod.unit}</em>
                    </span>
                    <span className="catalog-product-view">
                      Voir l'offre <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .catalogue-page { min-height: 100vh; background: var(--bg-white); }
        .page-header {
          background: var(--bg-dark);
          color: #fff;
          padding: 3rem 0;
          position: relative;
          overflow: hidden;
        }
        .page-header::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(26,36,30,0.95), rgba(26,36,30,0.7)),
            url('https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1920&q=80') center/cover;
          z-index: 1;
        }
        .page-header .container { position: relative; z-index: 2; }
        .breadcrumb { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: rgba(255,255,255,0.5); margin-bottom: 1rem; }
        .breadcrumb a { color: rgba(255,255,255,0.6); }
        .breadcrumb a:hover { color: #fff; }
        .breadcrumb-sep { color: rgba(255,255,255,0.3); }
        .page-header-tag {
          font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;
          color: var(--accent); display: block; margin-bottom: 0.5rem;
        }
        .page-header-title {
          font-family: var(--font-serif); font-size: 2.2rem; font-weight: 500;
          color: #fff; margin-bottom: 0.5rem;
        }
        .page-header-desc { font-size: 1rem; color: rgba(255,255,255,0.6); max-width: 500px; line-height: 1.6; }
        .catalog-toolbar {
          display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;
          margin-bottom: 1.5rem;
        }
        .catalog-search {
          position: relative; flex: 1; min-width: 240px;
        }
        .catalog-search svg {
          position: absolute; left: 1rem; top: 50%; transform: translateY(-50%);
          color: var(--text-muted);
        }
        .catalog-search input {
          width: 100%; padding: 0.75rem 1rem 0.75rem 2.75rem;
          border: 1px solid var(--border); border-radius: var(--radius-md);
          font-size: 0.875rem; outline: none; background: var(--bg-white);
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .catalog-search input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-light); }
        .catalog-search-clear {
          position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%);
          background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px;
        }
        .catalog-search-clear:hover { color: var(--text-dark); }
        .catalog-filter-chips { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .filter-chip {
          padding: 0.5rem 1rem; border-radius: 20px; border: 1px solid var(--border);
          background: var(--bg-white); color: var(--text-dark); cursor: pointer;
          font-size: 0.8125rem; font-weight: 500; transition: all 0.2s;
        }
        .filter-chip:hover { border-color: var(--primary); color: var(--primary); }
        .filter-chip--active { background: var(--primary); color: #fff; border-color: var(--primary); }
        .catalog-sort {
          display: flex; align-items: center; gap: 0.5rem;
        }
        .catalog-sort label { font-size: 0.8125rem; color: var(--text-muted); white-space: nowrap; }
        .catalog-sort select {
          padding: 0.5rem 0.75rem; border: 1px solid var(--border); border-radius: var(--radius-sm);
          font-size: 0.8125rem; outline: none; background: var(--bg-white); cursor: pointer;
        }
        .catalog-mobile-filter-btn { display: none; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.8125rem; font-weight: 500; cursor: pointer; background: var(--bg-white); }
        .catalog-results-info { margin-bottom: 1.5rem; font-size: 0.85rem; color: var(--text-muted); }
        .catalog-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; }
        .catalog-product-card {
          background: var(--bg-white); border-radius: var(--radius-lg); border: 1px solid var(--border);
          overflow: hidden; transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          display: flex; flex-direction: column; text-decoration: none; color: inherit;
        }
        .catalog-product-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-lg); border-color: var(--accent); }
        .catalog-product-image { position: relative; aspect-ratio: 1; background: #faf8f5; overflow: hidden; }
        .catalog-product-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
        .catalog-product-card:hover .catalog-product-image img { transform: scale(1.08); }
        .catalog-product-badge {
          position: absolute; top: 0.75rem; left: 0.75rem;
          background: rgba(26,36,30,0.85); backdrop-filter: blur(4px);
          color: #fff; padding: 3px 10px; border-radius: 20px;
          font-size: 0.65rem; font-weight: 600; z-index: 2;
        }
        .catalog-product-type {
          position: absolute; bottom: 0.75rem; left: 0.75rem;
          background: rgba(255,255,255,0.9); color: var(--text-dark);
          padding: 3px 8px; border-radius: 4px; font-size: 0.6rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
        }
        .catalog-product-body { padding: 1.15rem; display: flex; flex-direction: column; flex: 1; }
        .catalog-product-seller { font-size: 0.65rem; font-weight: 600; text-transform: uppercase; color: var(--primary); letter-spacing: 0.5px; margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }
        .catalog-verified { font-style: normal; display: inline-flex; align-items: center; gap: 2px; font-size: 0.6rem; color: var(--brand-green, #3a6b4f); text-transform: none; letter-spacing: normal; font-weight: 600; }
        .catalog-verified svg { fill: currentColor; }
        .catalog-product-unit { font-style: normal; font-size: 0.72rem; font-weight: 500; color: var(--text-muted); margin-left: 2px; }
        .catalog-product-name { font-family: var(--font-serif); font-size: 0.95rem; font-weight: 600; color: var(--text-dark); line-height: 1.4; margin-bottom: 0.5rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .catalog-product-rating { display: flex; align-items: center; gap: 0.375rem; margin-bottom: 0.75rem; font-size: 0.75rem; color: var(--text-muted); }
        .catalog-product-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 0.75rem; border-top: 1px solid var(--border); }
        .catalog-product-price { font-family: var(--font-display); font-size: 1rem; font-weight: 700; color: var(--primary); }
        .catalog-product-view { font-size: 0.75rem; color: var(--primary); font-weight: 600; display: flex; align-items: center; gap: 4px; }
        .catalog-empty { text-align: center; padding: 4rem 0; }
        .catalog-empty-icon { width: 64px; height: 64px; border-radius: 50%; background: var(--primary-light); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: var(--primary); }
        .catalog-empty h3 { font-family: var(--font-serif); margin-bottom: 0.5rem; }
        .catalog-empty p { color: var(--text-muted); margin-bottom: 1.5rem; font-size: 0.9rem; }

        @media (max-width: 1200px) { .catalog-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 900px) { .catalog-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) {
          .catalog-toolbar { flex-direction: column; align-items: stretch; }
          .catalog-search { min-width: auto; }
          .catalog-sort { display: none; }
          .catalog-filter-chips { overflow-x: auto; -webkit-overflow-scrolling: touch; flex-wrap: nowrap; padding-bottom: 4px; }
          .catalog-mobile-filter-btn { display: flex; }
          .catalog-grid { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
          .page-header-title { font-size: 1.8rem; }
        }
        @media (max-width: 480px) {
          .catalog-grid { grid-template-columns: 1fr; }
          .catalog-filter-chips { display: none; }
          .catalog-mobile-filter-btn { display: flex; }
        }
      `}</style>
    </div>
  );
};

export default Catalogue;

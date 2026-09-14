import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../services/catalog';
import { useCurrency } from '../context/CurrencyContext';
import { useLang } from '../context/LangContext';
import { Search, ArrowRight, Star, SlidersHorizontal, X, BadgeCheck, Check } from 'lucide-react';
import './Catalogue.css';
import './animations.css';
import SmartImg from '../components/common/SmartImg';
import { ProductGridSkeleton } from '../components/common/Skeletons';
import EmptyState from '../components/common/EmptyState';

const Catalogue = () => {
  const [searchParams] = useSearchParams();
  const { convert } = useCurrency();
  const { t } = useLang();
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
    { value: 'all', label: t('catalogue.filter.all') },
    { value: 'vanilla', label: t('catalogue.filter.vanilla') },
    { value: 'cacao', label: t('catalogue.filter.cacao') },
    { value: 'oil', label: t('catalogue.filter.oils') },
    { value: 'spices', label: t('catalogue.filter.spices') },
    { value: 'coffee', label: t('catalogue.filter.coffee') },
  ];

  const currentFilter = typeFilters.find(f => f.value === selectedCategory);

  return (
    <div className="catalogue-page">
      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <nav className="breadcrumb">
            <Link to="/">{t('nav.home')}</Link>
            <span className="breadcrumb-sep">/</span>
            <span>{t('catalogue.title')}</span>
          </nav>
          <span className="page-header-tag">{t('catalogue.tag')}</span>
          <h1 className="page-header-title">{t('catalogue.title')}</h1>
          <p className="page-header-desc">{t('catalogue.desc')}</p>
        </div>
      </section>

      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        {/* Search & Filters */}
        <div className="catalog-toolbar">
          <div className="catalog-search">
            <Search size={16} strokeWidth={1.5} />
            <input
              type="text"
              placeholder={t('catalogue.searchPlaceholder')}
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
            <label htmlFor="sort-select">{t('catalogue.sortLabel')}</label>
            <select id="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">{t('catalogue.sort.newest')}</option>
              <option value="price-asc">{t('catalogue.sort.priceAsc')}</option>
              <option value="price-desc">{t('catalogue.sort.priceDesc')}</option>
              <option value="rating">{t('catalogue.sort.rating')}</option>
            </select>
          </div>

          <button className="catalog-mobile-filter-btn" onClick={() => setShowMobileFilters(!showMobileFilters)}>
            <SlidersHorizontal size={16} />
            {t('catalogue.filters')}
          </button>
        </div>

        {/* Results info */}
        <div className="catalog-results-info">
          <span>{t('catalogue.productsFound', { count: sortedProducts.length })}</span>
          {selectedCategory !== 'all' && (
            <span> {t('catalogue.in')} <strong>{currentFilter?.label}</strong></span>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : sortedProducts.length === 0 ? (
          <EmptyState
            icon={Search}
            title={t('common.noResults')}
            text={t('catalogue.noResultsText')}
            action={
              <button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} className="btn btn-outline">
                {t('catalogue.resetFilters')}
              </button>
            }
          />
        ) : (
          <div className="catalog-grid">
            {sortedProducts.map((prod) => (
              <Link key={prod.id} to={`/product/${prod.id}`} className="catalog-product-card">
                <div className="catalog-product-image">
                  <SmartImg src={prod.images[0]} alt={prod.title} />
                  {prod.tag && <span className="catalog-product-badge">{prod.tag}</span>}
                  <span className="catalog-product-type">{prod.type}</span>
                </div>
                <div className="catalog-product-body">
                  <span className="catalog-product-seller">{prod.seller}{prod.verified && <em className="catalog-verified"><BadgeCheck size={12} /> {t('catalogue.verified')}</em>}</span>
                  <h3 className="catalog-product-name">{prod.title}</h3>
                  <div className="catalog-product-rating">
                    <div className="stars">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} size={13} fill={j < Math.floor(prod.rating) ? "#d4a373" : "rgba(212,163,115,0.25)"} color="#d4a373" />
                      ))}
                    </div>
                    <span>({prod.reviews})</span>
                  </div>
                  {prod.availability && (
                    <span className={`catalog-product-avail ${prod.available ? '' : 'catalog-product-avail--out'}`}>
                      {prod.available ? <Check size={11} /> : <X size={11} />}
                      {prod.available ? prod.availability : t('product.unavailable')}
                    </span>
                  )}
                  <div className="catalog-product-footer">
                    <span className="catalog-product-price">
                      {convert(prod.priceEUR)}
                      <em className="catalog-product-unit">/ {prod.unit}</em>
                    </span>
                    <span className="catalog-product-view">
                      {t('catalogue.viewOffer')} <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalogue;

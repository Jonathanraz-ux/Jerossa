import React from 'react';
import { Link } from 'react-router-dom';
import { blogPosts } from '../data/blog';
import { ArrowRight, Calendar, User, Folder } from 'lucide-react';
import './animations.css';

const Blog = () => {
  return (
    <div className="blog-page">
      {/* Premium Hero */}
      <section className="page-hero" style={{ height: '420px' }}>
        <div className="page-hero-content">
          <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
            <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>Accueil</a></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
              <li style={{ color: '#fff', fontWeight: 500 }}>Blog</li>
            </ol>
          </nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">Blog</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">Blog</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">Découvrez nos derniers articles sur les matières premières, les producteurs et l'univers Jerossa.</p>
        </div>
      </section>

      <div className="container">
        {/* Articles Grid */}
        <div className="scroll-animate blog-grid">
          {blogPosts.map((post, i) => (
            <Link key={post.id || i} to={`/blog/${post.title.toLowerCase().replace(/\s+/g, '-')}`} className="link-premium" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="premium-card" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
                <div className="img-zoom" style={{ position: 'relative', aspectRatio: '1', background: '#fafafa', overflow: 'hidden' }}>
                  <img src={post.image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                  <span className="product-badge" style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(30, 61, 47, 0.9)', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600 }}>{post.category}</span>
                </div>
                <div className="product-info" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {post.date}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={12} /> {post.author}</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 600, margin: '0 0 8px', color: 'var(--text-dark)', lineHeight: 1.4 }}>{post.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, flexGrow: 1 }}>{post.excerpt}</p>
                  <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontWeight: 600, fontSize: '13px' }}>
                    Lire la suite <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;
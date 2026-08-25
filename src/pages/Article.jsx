import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogPosts } from '../data/blog';
import { Calendar, User, Folder } from 'lucide-react';
import './animations.css';

const Article = () => {
  const { slug } = useParams();
  const post = blogPosts.find(p => p.title.toLowerCase().replace(/\s+/g, '-') === slug);

  if (!post) {
    return (
      <div className="container" style={{ minHeight: '80vh', textAlign: 'center' }}>
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
            <span className="page-hero-surtitre anim-fade-up stagger-1">Article introuvable</span>
            <h1 className="page-hero-title anim-fade-up stagger-2">Article introuvable</h1>
            <p className="page-hero-subtitle anim-fade-up stagger-3">L'article que vous recherchez n'existe pas.</p>
          </div>
        </section>
        <div className="scroll-animate" style={{ padding: '40px 0' }}>
          <Link to="/blog" className="btn btn-primary premium-btn" style={{ padding: '14px 28px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', color: '#fff', background: 'var(--primary)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>Retour au blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="article-page">
      {/* Premium Hero */}
<section className="page-hero" style={{ height: '420px' }}>
          <div className="page-hero-content">
          <nav className="anim-fade-down" style={{ marginBottom: '16px' }}>
            <ol style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              <li><a href="/" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>Accueil</a></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
              <li><Link to="/blog" className="link-premium" style={{ color: 'rgba(255,255,255,0.7)' }}>Blog</Link></li>
              <li style={{ color: 'rgba(255,255,255,0.4)' }}>/</li>
              <li style={{ color: '#fff', fontWeight: 500 }}>{post.title}</li>
            </ol>
          </nav>
          <span className="page-hero-surtitre anim-fade-up stagger-1">Article</span>
          <h1 className="page-hero-title anim-fade-up stagger-2">{post.title}</h1>
          <p className="page-hero-subtitle anim-fade-up stagger-3">{post.excerpt}</p>
        </div>
      </section>

      <div className="container">
        <header className="scroll-animate" style={{ marginBottom: '32px', maxWidth: '800px', margin: '0 auto 32px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, marginBottom: '16px' }}>
            <Folder size={12} /> {post.category}
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 600, lineHeight: 1.3, marginBottom: '16px', color: 'var(--text-dark)' }}>{post.title}</h1>
          <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {post.date}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={14} /> {post.author}</span>
          </div>
        </header>

        <div className="scroll-animate" style={{ borderTop: '1px solid var(--border)', paddingTop: '32px', maxWidth: '800px', margin: '0 auto' }}>
          {post.content.split('\n').map((paragraph, i) => (
            <p key={i} style={{ fontSize: '15px', lineHeight: 1.8, color: 'var(--text-dark)', marginBottom: '16px' }}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Article;
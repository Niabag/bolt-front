import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import "./home.scss";

const Home = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isVisible, setIsVisible] = useState({
    hero: false,
    features: false,
    steps: false,
    testimonials: false,
    pricing: false,
    cta: false
  });
  
  const sectionRefs = {
    hero: useRef(null),
    features: useRef(null),
    steps: useRef(null),
    testimonials: useRef(null),
    pricing: useRef(null),
    cta: useRef(null)
  };

  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // Observer pour les animations au scroll
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observers = {};
    
    Object.entries(sectionRefs).forEach(([key, ref]) => {
      if (ref.current) {
        observers[key] = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setIsVisible(prev => ({ ...prev, [key]: true }));
              observers[key].unobserve(entry.target);
            }
          });
        }, observerOptions);
        
        observers[key].observe(ref.current);
      }
    });

    return () => {
      Object.values(observers).forEach(observer => {
        observer.disconnect();
      });
    };
  }, []);

  const features = [
    {
      icon: "👥",
      title: "Gestion des Prospects",
      description: "Centralisez tous vos prospects avec un système de suivi avancé et des statuts personnalisables.",
      benefits: ["Capture automatique via QR code", "Statuts personnalisables", "Historique des interactions", "Segmentation par catégories"]
    },
    {
      icon: "📄",
      title: "Devis Professionnels",
      description: "Créez des devis élégants avec calculs automatiques et export PDF professionnel.",
      benefits: ["Modèles personnalisables", "Calculs automatiques de TVA", "Export PDF haute qualité", "Suivi des statuts"]
    },
    {
      icon: "💰",
      title: "Facturation Simplifiée",
      description: "Transformez vos devis en factures en un clic et suivez vos paiements facilement.",
      benefits: ["Conversion devis en factures", "Suivi des paiements", "Rappels automatiques", "Tableau de bord financier"]
    },
    {
      icon: "💼",
      title: "Carte de Visite Numérique",
      description: "Générez votre QR code personnalisé pour capturer automatiquement vos prospects.",
      benefits: ["QR code personnalisable", "Formulaire d'inscription intégré", "Statistiques de scans", "Séquences d'actions configurables"]
    },
    {
      icon: "📊",
      title: "Analytics Avancés",
      description: "Suivez vos performances avec des tableaux de bord détaillés et des métriques clés.",
      benefits: ["Tableaux de bord en temps réel", "Suivi du CA réalisé et potentiel", "Analyse des taux de conversion", "Rapports d'activité"]
    },
    {
      icon: "🔔",
      title: "Notifications Intelligentes",
      description: "Restez informé des opportunités importantes avec des alertes personnalisées.",
      benefits: ["Alertes personnalisables", "Rappels de suivi", "Notifications de nouveaux prospects", "Alertes de devis en attente"]
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Créez votre compte",
      description: "Inscrivez-vous en 2 minutes et configurez votre profil professionnel.",
      icon: "🚀"
    },
    {
      number: "02",
      title: "Générez votre QR code",
      description: "Créez votre carte de visite numérique avec QR code personnalisé.",
      icon: "📱"
    },
    {
      number: "03",
      title: "Capturez vos prospects",
      description: "Laissez vos prospects s'inscrire automatiquement en scannant votre QR code.",
      icon: "👥"
    },
    {
      number: "04",
      title: "Créez des devis professionnels",
      description: "Envoyez des devis élégants et convertissez vos prospects en clients.",
      icon: "💰"
    }
  ];

  const testimonials = [
    {
      name: "Sophie Martin",
      company: "Consultante Indépendante",
      text: "CRM Pro a révolutionné ma gestion client. Je gagne 3h par jour et j'ai augmenté mon chiffre d'affaires de 30% en 3 mois !",
      avatar: "S",
      rating: 5
    },
    {
      name: "Thomas Dubois",
      company: "Architecte d'intérieur",
      text: "La carte de visite numérique est géniale ! Mes prospects s'inscrivent directement dans mon CRM après avoir scanné mon QR code.",
      avatar: "T",
      rating: 5
    },
    {
      name: "Marie Leroy",
      company: "Coach professionnelle",
      text: "Interface intuitive et fonctionnalités complètes. J'ai essayé plusieurs CRM et celui-ci est de loin le meilleur pour mon activité.",
      avatar: "M",
      rating: 5
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className={`hero-section ${isVisible.hero ? 'animate' : ''}`} ref={sectionRefs.hero}>
        <div className="hero-background">
          <div className="hero-shape shape-1"></div>
          <div className="hero-shape shape-2"></div>
          <div className="hero-shape shape-3"></div>
        </div>
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="title-line">Gérez vos <span className="gradient-text">prospects</span></span>
              <span className="title-line">et <span className="gradient-text">devis</span> comme un pro</span>
            </h1>
            <p className="hero-subtitle">
              La solution CRM complète pour les entrepreneurs et freelances. 
              Capturez, suivez et convertissez vos prospects en clients avec des outils modernes.
            </p>
            <div className="hero-actions">
              {isLoggedIn ? (
                <button 
                  onClick={() => navigate("/dashboard")}
                  className="btn-primary"
                >
                  <span className="btn-icon">📊</span>
                  <span className="btn-text">Accéder au Dashboard</span>
                </button>
              ) : (
                <>
                  <Link to="/register-user" className="btn-primary">
                    <span className="btn-icon">🚀</span>
                    <span className="btn-text">Commencer gratuitement</span>
                  </Link>
                  <Link to="/login" className="btn-secondary">
                    <span className="btn-icon">🔐</span>
                    <span className="btn-text">Se connecter</span>
                  </Link>
                </>
              )}
            </div>
            <div className="hero-price">
              <div className="price-tag">
                <span className="price-amount">13€</span>
                <span className="price-period">/mois</span>
              </div>
              <span className="price-info">Essai gratuit de 14 jours • Aucune carte bancaire requise</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="dashboard-preview">
              <div className="preview-header">
                <div className="preview-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="preview-title">CRM Pro Dashboard</span>
              </div>
              <div className="preview-content">
                <div className="preview-stats">
                  <div className="stat-card">
                    <span className="stat-number">127</span>
                    <span className="stat-label">Prospects</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">45K€</span>
                    <span className="stat-label">CA Réalisé</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">89%</span>
                    <span className="stat-label">Conversion</span>
                  </div>
                </div>
                <div className="preview-chart">
                  <div className="chart-bars">
                    <div className="bar" style={{height: '60%'}}></div>
                    <div className="bar" style={{height: '80%'}}></div>
                    <div className="bar" style={{height: '45%'}}></div>
                    <div className="bar" style={{height: '90%'}}></div>
                    <div className="bar" style={{height: '70%'}}></div>
                    <div className="bar" style={{height: '85%'}}></div>
                  </div>
                </div>
                <div className="preview-clients">
                  <div className="client-row">
                    <div className="client-avatar">S</div>
                    <div className="client-info">
                      <span className="client-name">Sophie Martin</span>
                      <span className="client-status new">Nouveau</span>
                    </div>
                    <div className="client-action">Contacter</div>
                  </div>
                  <div className="client-row">
                    <div className="client-avatar">T</div>
                    <div className="client-info">
                      <span className="client-name">Thomas Dubois</span>
                      <span className="client-status pending">En attente</span>
                    </div>
                    <div className="client-action">Contacter</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-scroll">
          <div className="scroll-indicator">
            <span>Découvrir</span>
            <div className="scroll-arrow">↓</div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="trusted-section">
        <div className="trusted-container">
          <div className="trusted-intro">
            <div className="trusted-line"></div>
            <span>Ils nous font confiance</span>
            <div className="trusted-line"></div>
          </div>
          <div className="trusted-logos">
            <div className="trusted-logo">Entreprise 1</div>
            <div className="trusted-logo">Entreprise 2</div>
            <div className="trusted-logo">Entreprise 3</div>
            <div className="trusted-logo">Entreprise 4</div>
            <div className="trusted-logo">Entreprise 5</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`features-section ${isVisible.features ? 'animate' : ''}`} ref={sectionRefs.features}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Fonctionnalités</span>
            <h2>Tout ce dont vous avez besoin</h2>
            <p>Des outils puissants pour développer votre business</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <ul className="feature-benefits">
                  {feature.benefits.map((benefit, i) => (
                    <li key={i}>{benefit}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className={`pricing-section ${isVisible.pricing ? 'animate' : ''}`} ref={sectionRefs.pricing}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Tarification</span>
            <h2>Une offre simple et transparente</h2>
            <p>Tous les outils dont vous avez besoin pour un prix unique</p>
          </div>
          <div className="pricing-card-container">
            <div className="pricing-card">
              <div className="pricing-badge">Offre Unique</div>
              <h3 className="pricing-title">Abonnement Pro</h3>
              <div className="pricing-price">
                <span className="price-amount">13€</span>
                <span className="price-period">/mois</span>
              </div>
              <p className="pricing-description">
                Accès complet à toutes les fonctionnalités pour développer votre activité
              </p>
              <ul className="pricing-features">
                <li>✅ Nombre illimité de prospects</li>
                <li>✅ Création illimitée de devis professionnels</li>
                <li>✅ Génération de factures</li>
                <li>✅ Carte de visite numérique avec QR code</li>
                <li>✅ Tableaux de bord et analytics</li>
                <li>✅ Notifications intelligentes</li>
                <li>✅ Export PDF et partage</li>
                <li>✅ Support prioritaire</li>
                <li>✅ Mises à jour régulières</li>
              </ul>
              <Link to="/register-user" className="pricing-cta">
                Commencer maintenant
              </Link>
              <p className="pricing-guarantee">Satisfait ou remboursé pendant 30 jours</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className={`steps-section ${isVisible.steps ? 'animate' : ''}`} ref={sectionRefs.steps}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Comment ça marche</span>
            <h2>En 4 étapes simples</h2>
            <p>Commencez à utiliser CRM Pro en quelques minutes</p>
          </div>
          <div className="steps-container">
            {steps.map((step, index) => (
              <div key={index} className="step" style={{animationDelay: `${index * 0.15}s`}}>
                <div className="step-content">
                  <div className="step-number">{step.number}</div>
                  <div className="step-icon">{step.icon}</div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
                {index < steps.length - 1 && <div className="step-connector"></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={`testimonials-section ${isVisible.testimonials ? 'animate' : ''}`} ref={sectionRefs.testimonials}>
        <div className="container">
          <div className="section-header light">
            <span className="section-tag">Témoignages</span>
            <h2>Ce que disent nos clients</h2>
            <p>Découvrez comment CRM Pro transforme l'activité de nos utilisateurs</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card" style={{animationDelay: `${index * 0.15}s`}}>
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="star">★</span>
                  ))}
                </div>
                <div className="testimonial-content">
                  <p>"{testimonial.text}"</p>
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">{testimonial.avatar}</div>
                  <div className="author-info">
                    <h4>{testimonial.name}</h4>
                    <span>{testimonial.company}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`cta-section ${isVisible.cta ? 'animate' : ''}`} ref={sectionRefs.cta}>
        <div className="container">
          <div className="cta-content">
            <h2>Prêt à booster votre business ?</h2>
            <p>Rejoignez des milliers d'entrepreneurs qui utilisent déjà CRM Pro</p>
            <div className="cta-actions">
              {isLoggedIn ? (
                <button 
                  onClick={() => navigate("/dashboard")}
                  className="btn-primary large"
                >
                  <span className="btn-icon">📊</span>
                  <span className="btn-text">Accéder au Dashboard</span>
                </button>
              ) : (
                <Link to="/register-user" className="btn-primary large">
                  <span className="btn-icon">🚀</span>
                  <span className="btn-text">Commencer maintenant</span>
                </Link>
              )}
            </div>
            <div className="cta-info">
              <div className="cta-info-item">
                <span className="info-icon">🔒</span>
                <span>Données sécurisées</span>
              </div>
              <div className="cta-info-item">
                <span className="info-icon">⚡</span>
                <span>Configuration en 2 minutes</span>
              </div>
              <div className="cta-info-item">
                <span className="info-icon">💳</span>
                <span>13€/mois seulement</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
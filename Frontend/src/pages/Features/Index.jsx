import './features.scss';

const Features = () => (
  <div className="features-page">
    <div className="features-header">
      <h1>Fonctionnalités CRM Pro</h1>
      <p>Des outils puissants pour développer votre activité</p>
    </div>

    <div className="features-container">
      <section className="features-section">
        <h2>Tout ce dont vous avez besoin pour réussir</h2>
        <p className="section-intro">
          CRM Pro regroupe tous les outils essentiels pour gérer efficacement votre prospection commerciale, 
          créer des devis professionnels et suivre vos performances en temps réel.
        </p>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Gestion des Prospects</h3>
            <p>
              Centralisez tous vos contacts commerciaux et suivez leur progression dans votre tunnel de vente. 
              Organisez vos prospects avec des statuts personnalisés et des notes détaillées.
            </p>
            <ul className="feature-list">
              <li>Capture automatique via QR code</li>
              <li>Statuts personnalisables</li>
              <li>Historique des interactions</li>
              <li>Segmentation par catégories</li>
            </ul>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📄</div>
            <h3>Devis Professionnels</h3>
            <p>
              Créez des devis élégants en quelques clics avec notre éditeur intuitif. Ajoutez votre logo, 
              personnalisez les conditions et générez des PDF professionnels instantanément.
            </p>
            <ul className="feature-list">
              <li>Modèles personnalisables</li>
              <li>Calculs automatiques de TVA</li>
              <li>Export PDF haute qualité</li>
              <li>Suivi des statuts (nouveau, en attente, finalisé)</li>
            </ul>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Facturation Simplifiée</h3>
            <p>
              Transformez vos devis en factures en un clic. Gérez vos paiements et suivez votre chiffre d'affaires 
              avec notre module de facturation intégré.
            </p>
            <ul className="feature-list">
              <li>Conversion devis en factures</li>
              <li>Suivi des paiements</li>
              <li>Rappels automatiques</li>
              <li>Tableau de bord financier</li>
            </ul>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💼</div>
            <h3>Carte de Visite Numérique</h3>
            <p>
              Générez votre propre carte de visite numérique avec QR code personnalisé. Permettez à vos prospects 
              de s'inscrire directement dans votre CRM en scannant votre code.
            </p>
            <ul className="feature-list">
              <li>QR code personnalisable</li>
              <li>Formulaire d'inscription intégré</li>
              <li>Statistiques de scans</li>
              <li>Séquences d'actions configurables</li>
            </ul>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Analytics Avancés</h3>
            <p>
              Suivez vos performances commerciales avec des tableaux de bord détaillés. Visualisez votre chiffre d'affaires, 
              taux de conversion et autres métriques clés en temps réel.
            </p>
            <ul className="feature-list">
              <li>Tableaux de bord personnalisables</li>
              <li>Suivi du CA réalisé et potentiel</li>
              <li>Analyse des taux de conversion</li>
              <li>Rapports d'activité</li>
            </ul>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔔</div>
            <h3>Notifications Intelligentes</h3>
            <p>
              Restez informé des opportunités importantes avec notre système de notifications. Ne manquez jamais 
              une occasion de conclure une vente ou de relancer un prospect.
            </p>
            <ul className="feature-list">
              <li>Alertes personnalisables</li>
              <li>Rappels de suivi</li>
              <li>Notifications de nouveaux prospects</li>
              <li>Alertes de devis en attente</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="comparison-section">
        <h2>Pourquoi choisir CRM Pro ?</h2>
        <p className="section-intro">
          CRM Pro se distingue par sa simplicité d'utilisation et son excellent rapport qualité-prix. 
          Découvrez comment nous nous comparons aux autres solutions du marché.
        </p>

        <div className="comparison-table-container">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Fonctionnalité</th>
                <th>CRM Pro</th>
                <th>Autres CRM</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Prix mensuel</td>
                <td className="highlight">13€ / mois</td>
                <td>30€ - 100€ / mois</td>
              </tr>
              <tr>
                <td>Carte de visite numérique</td>
                <td className="highlight">✅ Inclus</td>
                <td>❌ Non disponible</td>
              </tr>
              <tr>
                <td>Nombre de prospects</td>
                <td className="highlight">Illimité</td>
                <td>Limité par forfait</td>
              </tr>
              <tr>
                <td>Devis et factures</td>
                <td className="highlight">✅ Inclus</td>
                <td>Souvent en option</td>
              </tr>
              <tr>
                <td>Configuration requise</td>
                <td className="highlight">2 minutes</td>
                <td>Plusieurs heures</td>
              </tr>
              <tr>
                <td>Engagement</td>
                <td className="highlight">Aucun</td>
                <td>Souvent annuel</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="testimonials-section">
        <h2>Ce que disent nos utilisateurs</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>"CRM Pro a révolutionné ma gestion client. Je gagne 3h par jour et j'ai augmenté mon chiffre d'affaires de 30% en 3 mois !"</p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">S</div>
              <div className="author-info">
                <h4>Sophie Martin</h4>
                <span>Consultante indépendante</span>
              </div>
            </div>
          </div>
          
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>"La carte de visite numérique est géniale ! Mes prospects s'inscrivent directement dans mon CRM après avoir scanné mon QR code."</p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">T</div>
              <div className="author-info">
                <h4>Thomas Dubois</h4>
                <span>Agent immobilier</span>
              </div>
            </div>
          </div>
          
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>"Interface intuitive et fonctionnalités complètes. J'ai essayé plusieurs CRM et celui-ci est de loin le meilleur pour mon activité."</p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">L</div>
              <div className="author-info">
                <h4>Laura Bernard</h4>
                <span>Architecte d'intérieur</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div className="features-cta">
      <div className="cta-content">
        <h2>Prêt à développer votre activité ?</h2>
        <p>Rejoignez des milliers d'entrepreneurs qui utilisent CRM Pro</p>
        <a href="/register-user" className="cta-button">
          Commencer votre essai gratuit
        </a>
        <p className="cta-note">Aucune carte bancaire requise • 13€/mois après la période d'essai</p>
      </div>
    </div>
  </div>
);

export default Features;
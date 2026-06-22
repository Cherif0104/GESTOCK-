import type { GestockViewModel } from "../application/buildGestockViewModel";

interface AppProps {
  model: GestockViewModel;
}

export function App({ model: _model }: AppProps) {
  return (
    <main className="login-page" aria-label="Connexion GESTOCK">
      <section className="brand-panel" aria-label="Présentation de GESTOCK">
        <div className="brand-overlay" />

        <div className="brand-content">
          <div className="gestock-logo" aria-label="GESTOCK">
            <span>GES</span>
            <strong>TOCK</strong>
            <i aria-hidden="true">◆</i>
          </div>

          <p className="brand-subtitle">
            PLATEFORME DE GESTION DES STOCKS
            <br />
            ET APPROVISIONNEMENTS
          </p>

          <h1>
            Maîtrisez <span>vos stocks.</span>
            <br />
            Optimisez votre chaîne
            <br />
            d'approvisionnement.
          </h1>

          <div className="feature-list">
            <FeatureCard
              icon="▣"
              title="Visibilité en temps réel"
              text="Suivez vos stocks et mouvements en direct."
            />
            <FeatureCard
              icon="▤"
              title="Performance opérationnelle"
              text="Prenez les bonnes décisions, plus rapidement."
            />
            <FeatureCard
              icon="◇"
              title="Traçabilité complète"
              text="Suivez chaque article, lot et mouvement."
            />
            <FeatureCard
              icon="♢"
              title="Alertes intelligentes"
              text="Anticipez les ruptures et péremptions."
            />
          </div>
        </div>

        <small className="copyright">© 2024 GESTOCK. Tous droits réservés.</small>
      </section>

      <section className="auth-panel" aria-label="Formulaire de connexion">
        <button className="language-button" type="button">
          <span aria-hidden="true">◎</span>
          Français
          <span aria-hidden="true">⌄</span>
        </button>

        <div className="dots" aria-hidden="true" />

        <form className="login-card">
          <header>
            <h2>
              Connexion à <span>GESTOCK</span>
            </h2>
            <p>Accédez à votre espace de gestion</p>
          </header>

          <label className="field">
            <span>Adresse e-mail</span>
            <div className="input-shell">
              <i aria-hidden="true">✉</i>
              <input placeholder="Entrez votre adresse e-mail" type="email" />
            </div>
          </label>

          <label className="field">
            <span>Mot de passe</span>
            <div className="input-shell">
              <i aria-hidden="true">▣</i>
              <input placeholder="Entrez votre mot de passe" type="password" />
              <button aria-label="Afficher le mot de passe" type="button">
                ◉
              </button>
            </div>
          </label>

          <div className="form-options">
            <label>
              <input defaultChecked type="checkbox" />
              <span>Se souvenir de moi</span>
            </label>
            <button type="button">Mot de passe oublié ?</button>
          </div>

          <button className="submit-button" type="button">
            Se connecter
          </button>

          <div className="divider">
            <span />
            <small>OU</small>
            <span />
          </div>

          <button className="sso-button" type="button">
            <span aria-hidden="true">▥</span>
            Se connecter avec SSO / Enterprise
          </button>

          <footer className="first-login">
            <strong>Première connexion à GESTOCK ?</strong>
            <button type="button">Contacter votre administrateur</button>
          </footer>
        </form>

        <div className="trust-row" aria-label="Engagements sécurité">
          <TrustItem icon="♢" title="Sécurisé" text="Données chiffrées" />
          <TrustItem icon="☁" title="Hébergé au Sénégal" text="Haute disponibilité" />
          <TrustItem icon="♙" title="Multi-utilisateurs" text="Accès par rôles" />
          <TrustItem icon="◷" title="Audit complet" text="Traçabilité totale" />
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <article className="feature-card">
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </article>
  );
}

function TrustItem({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <article className="trust-item">
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <small>{text}</small>
      </div>
    </article>
  );
}

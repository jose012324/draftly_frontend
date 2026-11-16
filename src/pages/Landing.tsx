import { Link } from 'react-router-dom';

import { Brand } from '../components/ui/Brand';
import { Icon, type IconName } from '../components/ui/Icon';
import { useAuth } from '../hooks/useAuth';

interface Feature {
  icon: IconName;
  title: string;
  text: string;
}

const FEATURES: Feature[] = [
  {
    icon: 'pen',
    title: 'A real editor',
    text: 'Headings, lists, quotes, code blocks and inline marks. Formatting survives closing the document.',
  },
  {
    icon: 'upload',
    title: 'Import real files',
    text: 'TXT, Markdown and DOCX are converted into editable documents — not attachments.',
  },
  {
    icon: 'users',
    title: 'Permissions that hold',
    text: 'Owner, editor and viewer roles — checked on every request by the API.',
  },
  {
    icon: 'clock',
    title: 'Autosave you can trust',
    text: 'An 800 ms debounce, a serialised queue and a save state you can actually see.',
  },
];

const STEPS = [
  {
    number: '01',
    title: 'Create or import',
    text: 'Start from a blank page, or bring an existing .txt, .md or .docx file with you.',
  },
  {
    number: '02',
    title: 'Write and format',
    text: 'A distraction-free page with the formatting controls you need and nothing else.',
  },
  {
    number: '03',
    title: 'Share with a role',
    text: 'Give a colleague editor or viewer access — and revoke it whenever you want.',
  },
];

const ROLES = [
  {
    name: 'Owner',
    description: 'The person who created the document.',
    rights: [
      { label: 'Read the document', allowed: true },
      { label: 'Edit the content', allowed: true },
      { label: 'Share and revoke access', allowed: true },
      { label: 'Delete permanently', allowed: true },
    ],
  },
  {
    name: 'Editor',
    description: 'Can change the content, but not the access.',
    rights: [
      { label: 'Read the document', allowed: true },
      { label: 'Edit the content', allowed: true },
      { label: 'Share and revoke access', allowed: false },
      { label: 'Delete permanently', allowed: false },
    ],
  },
  {
    name: 'Viewer',
    description: 'Can read the document, nothing more.',
    rights: [
      { label: 'Read the document', allowed: true },
      { label: 'Edit the content', allowed: false },
      { label: 'Share and revoke access', allowed: false },
      { label: 'Delete permanently', allowed: false },
    ],
  },
];

export function LandingPage() {
  const { isAuthenticated } = useAuth();
  const workspaceLink = isAuthenticated ? '/app' : '/login';

  return (
    <div className="landing">
      <nav className="landing__nav">
        <Link to="/" className="landing__brand">
          <Brand />
        </Link>

        <div className="landing__links">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#permissions">Permissions</a>
          <a href="#formats">Formats</a>
        </div>

        <div className="landing__actions">
          {!isAuthenticated ? (
            <Link to="/login" className="btn btn--ghost btn--sm">
              Sign in
            </Link>
          ) : null}
          <Link to={workspaceLink} className="btn btn--primary btn--sm">
            Open workspace
            <Icon name="arrowRight" size={14} />
          </Link>
        </div>
      </nav>

      <header className="landing__hero">
        <div>
          <p className="landing__eyebrow">A collaborative document workspace</p>
          <h1 className="landing__headline">
            Writing, without the <em>noise</em>.
          </h1>
          <p className="landing__lede">
            Draftly is a document workspace with a real editor, real file import and real
            access control. Write on a clean page, share with a role, and let the server
            keep the rules.
          </p>

          <div className="landing__cta">
            <Link to={workspaceLink} className="btn btn--primary">
              Open the workspace
              <Icon name="arrowRight" size={15} />
            </Link>
            {!isAuthenticated ? (
              <Link to="/register" className="btn btn--secondary">
                Create an account
              </Link>
            ) : null}
          </div>

          <p className="landing__note">
            <Icon name="info" size={14} />
            No signup needed to look around — try
            <code>alice@draftly.demo</code>
            with <code>draftly123</code>.
          </p>
        </div>

        <div className="landing__visual" aria-hidden="true">
          <div className="mock">
            <div className="mock__bar">
              <span className="mock__dots">
                <span className="mock__dot" />
                <span className="mock__dot" />
                <span className="mock__dot" />
              </span>
              <span className="mock__file">
                <Icon name="document" size={13} />
                Project Proposal
              </span>
              <span className="mock__saved">
                <Icon name="check" size={12} strokeWidth={2.4} />
                Saved
              </span>
            </div>

            <div className="mock__toolbar">
              <span className="mock__tool mock__tool--active">
                <Icon name="bold" size={13} strokeWidth={2} />
              </span>
              <span className="mock__tool">
                <Icon name="italic" size={13} strokeWidth={2} />
              </span>
              <span className="mock__tool">
                <Icon name="underline" size={13} strokeWidth={2} />
              </span>
              <span className="mock__rule" />
              <span className="mock__tool">
                <Icon name="h2" size={13} strokeWidth={2} />
              </span>
              <span className="mock__tool">
                <Icon name="bulletList" size={13} strokeWidth={2} />
              </span>
              <span className="mock__tool">
                <Icon name="orderedList" size={13} strokeWidth={2} />
              </span>
            </div>

            <div className="mock__page">
              <h3 className="mock__title">Project Proposal</h3>
              <p className="mock__body">
                Draftly keeps <strong>writing, organising and sharing</strong> in one
                workspace. This document is shared with the team, so feedback lands in the
                place where the work happens.
              </p>
              <ul className="mock__list">
                <li>Import .txt, .md and .docx as editable documents</li>
                <li>Share with viewer or editor roles</li>
                <li>Autosave every change, 800 ms after you stop typing</li>
              </ul>
            </div>

            <div className="mock__share">
              <span className="mock__avatars">
                <span className="avatar avatar--sm avatar--emerald">AA</span>
                <span className="avatar avatar--sm">BB</span>
              </span>
              <span>2 people have access</span>
              <span className="mock__role">Can edit</span>
            </div>
          </div>
        </div>
      </header>

      <section className="landing__strip" id="features">
        <div className="landing__strip-inner">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="landing__feature">
              <span className="landing__feature-icon">
                <Icon name={feature.icon} size={15} />
              </span>
              <h3 className="landing__feature-title">{feature.title}</h3>
              <p className="landing__feature-text">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing__section" id="how">
        <div className="landing__section-head">
          <p className="eyebrow">How it works</p>
          <h2 className="landing__section-title">Three steps, nothing to configure.</h2>
          <p className="landing__section-text">
            Draftly deliberately stays small. There is no workspace to set up, no team to
            invite and no template library to browse — you open a document and start writing.
          </p>
        </div>

        <div className="landing__steps">
          {STEPS.map((step) => (
            <article key={step.number} className="landing__step">
              <span className="landing__step-number">{step.number}</span>
              <h3 className="landing__step-title">{step.title}</h3>
              <p className="landing__step-text">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing__section" id="permissions">
        <div className="landing__section-head">
          <p className="eyebrow">Permissions</p>
          <h2 className="landing__section-title">The rules live on the server.</h2>
          <p className="landing__section-text">
            Hiding a button is not security. Every document request is checked against the
            role of the person making it, so a viewer who calls the API directly is turned
            away — and a revoked collaborator loses access immediately.
          </p>
        </div>

        <div className="landing__roles">
          {ROLES.map((role) => (
            <article key={role.name} className="landing__role">
              <h3 className="landing__role-name">{role.name}</h3>
              <p className="landing__step-text" style={{ marginBottom: '0.85rem' }}>
                {role.description}
              </p>
              <div className="landing__role-list">
                {role.rights.map((right) => (
                  <span
                    key={right.label}
                    className={`landing__role-item ${right.allowed ? 'landing__role-item--yes' : ''}`.trim()}
                  >
                    <Icon
                      name={right.allowed ? 'check' : 'minus'}
                      size={13}
                      strokeWidth={right.allowed ? 2.4 : 1.8}
                    />
                    {right.label}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="landing__section" id="formats">
        <div className="landing__section-head">
          <p className="eyebrow">Import</p>
          <h2 className="landing__section-title">Bring what you already wrote.</h2>
          <p className="landing__section-text">
            Uploaded files are parsed on the server and stored as editable TipTap documents.
            Markdown headings and lists survive, DOCX paragraph styles are mapped, and plain
            text becomes paragraphs.
          </p>
        </div>

        <div className="landing__formats">
          <span className="landing__format">
            <Icon name="file" size={14} />
            <strong>.TXT</strong> plain text
          </span>
          <span className="landing__format">
            <Icon name="file" size={14} />
            <strong>.MD</strong> markdown
          </span>
          <span className="landing__format">
            <Icon name="file" size={14} />
            <strong>.DOCX</strong> word documents
          </span>
          <span className="landing__format">
            <Icon name="lock" size={14} />
            max <strong>5 MB</strong> per file
          </span>
        </div>
      </section>

      <section className="landing__cta-band">
        <div className="landing__cta-inner">
          <div>
            <h2 className="landing__cta-title">Open a document and start writing.</h2>
            <p className="landing__cta-text">
              Two demo accounts are seeded for you — one owner, one collaborator — so the
              whole sharing flow can be tried in a minute.
            </p>
          </div>

          <div className="landing__cta-actions">
            <Link to={workspaceLink} className="btn btn--primary">
              Open the workspace
              <Icon name="arrowRight" size={15} />
            </Link>
            {!isAuthenticated ? (
              <Link to="/register" className="btn btn--secondary">
                Create an account
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <footer className="landing__footer">
        <div className="landing__footer-inner">
          <Brand />

          <div className="landing__footer-links">
            <Link to="/login">Sign in</Link>
            <Link to="/register">Register</Link>
            <Link to="/app">Workspace</Link>
          </div>

          <span>React · Vite · TipTap — Django · DRF</span>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;

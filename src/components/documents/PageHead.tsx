import type { ReactNode } from 'react';

interface PageHeadProps {
  eyebrow?: string;
  title: string;
  text?: string;
  actions?: ReactNode;
}

/** The header of a workspace page: eyebrow, title, supporting line, actions. */
export function PageHead({ eyebrow, title, text, actions }: PageHeadProps) {
  return (
    <header className="page-head">
      <div>
        {eyebrow ? <p className="eyebrow page-head__eyebrow">{eyebrow}</p> : null}
        <h1 className="page-head__title">{title}</h1>
        {text ? <p className="page-head__text">{text}</p> : null}
      </div>

      {actions ? <div className="page-head__actions">{actions}</div> : null}
    </header>
  );
}

export default PageHead;

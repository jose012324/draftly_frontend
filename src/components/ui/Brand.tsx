import { Icon } from './Icon';

interface BrandProps {
  /** Show the small tagline under the wordmark. */
  showTagline?: boolean;
}

/** The Draftly wordmark: an ink square with a page-fold glyph. */
export function Brand({ showTagline = false }: BrandProps) {
  return (
    <span className="brand">
      <span className="brand__mark">
        <Icon name="document" size={13} strokeWidth={2} />
      </span>
      <span className="brand__text">
        <span className="brand__name">Draftly</span>
        {showTagline ? (
          <span className="brand__tagline">Collaborative workspace</span>
        ) : null}
      </span>
    </span>
  );
}

export default Brand;

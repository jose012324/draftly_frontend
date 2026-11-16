interface LoadingBlockProps {
  label?: string;
}

export function LoadingBlock({ label = 'Loading…' }: LoadingBlockProps) {
  return (
    <div className="loading-block">
      <span className="spinner spinner--lg" />
      <span>{label}</span>
    </div>
  );
}

/** Placeholder rows while a document list is loading. */
export function SkeletonSheet({ count = 6 }: { count?: number }) {
  return (
    <div className="doc-sheet">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton skeleton--row" />
      ))}
    </div>
  );
}

export default LoadingBlock;

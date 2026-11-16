import { DocumentsView } from '../components/documents/DocumentsView';

export function RecentPage() {
  return (
    <DocumentsView
      scope="recent"
      eyebrow="Workspace"
      title="Recent"
      subtitle="Documents you worked on lately — yours and shared ones."
      emptyIcon="clock"
      emptyTitle="No recent documents"
      emptyText="Open a document and it will show up here automatically."
    />
  );
}

export default RecentPage;

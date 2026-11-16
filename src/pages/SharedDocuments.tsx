import { DocumentsView } from '../components/documents/DocumentsView';

export function SharedDocumentsPage() {
  return (
    <DocumentsView
      scope="shared"
      eyebrow="Workspace"
      title="Shared with Me"
      subtitle="Documents other people shared with you, and the role you have on them."
      emptyIcon="users"
      emptyTitle="Nothing shared with you yet"
      emptyText="When someone shares a document with you it will appear here."
    />
  );
}

export default SharedDocumentsPage;

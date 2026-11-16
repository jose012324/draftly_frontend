import { DocumentsView } from '../components/documents/DocumentsView';

export function MyDocumentsPage() {
  return (
    <DocumentsView
      scope="mine"
      eyebrow="Workspace"
      title="My Documents"
      subtitle="Everything you own, ordered by the last change."
      emptyIcon="files"
      emptyTitle="No documents yet"
      emptyText="Create your first document or import an existing file to get started."
    />
  );
}

export default MyDocumentsPage;

import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { documentService } from '../../services/documentService';
import { CreateDocumentModal } from '../documents/CreateDocumentModal';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface Counts {
  mine: number;
  shared: number;
  recent: number;
  trash: number;
}

/**
 * The authenticated application shell: sidebar on the left, a sticky top bar
 * with the global search and the page content on the right.
 */
export function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [counts, setCounts] = useState<Counts>({ mine: 0, shared: 0, recent: 0, trash: 0 });

  /* Sidebar counters — refreshed whenever the route changes. */
  const loadCounts = useCallback(async () => {
    try {
      const [documents, trashed] = await Promise.all([
        documentService.list({ scope: 'all' }),
        documentService.list({ scope: 'trash' }),
      ]);

      setCounts({
        mine: documents.filter((doc) => doc.role === 'owner').length,
        shared: documents.filter((doc) => doc.role !== 'owner').length,
        recent: documents.length,
        trash: trashed.length,
      });
    } catch {
      /* counters are decorative — never block the UI on them */
    }
  }, []);

  useEffect(() => {
    void loadCounts();
  }, [loadCounts, location.pathname]);

  return (
    <div className="shell">
      <Sidebar
        isOpen={isSidebarOpen}
        counts={counts}
        onClose={() => setSidebarOpen(false)}
      />

      {isSidebarOpen ? (
        <button
          type="button"
          className="scrim"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <div className="shell__main">
        <Header
          onToggleSidebar={() => setSidebarOpen((open) => !open)}
          onCreateDocument={() => setCreateOpen(true)}
        />

        <main className="workspace">
          <Outlet />
        </main>
      </div>

      <CreateDocumentModal
        isOpen={isCreateOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(doc) => navigate(`/documents/${doc.id}`)}
      />
    </div>
  );
}

export default AppShell;

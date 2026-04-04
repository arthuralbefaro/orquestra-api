import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Bot,
  ActivitySquare,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react';
import { useAuth } from '../contexts/useAuth';
import { useTheme } from '../contexts/useTheme';

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const navItems = [
    { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/projects', label: 'Projetos', icon: <FolderKanban size={18} /> },
    { to: '/automations', label: 'Automações', icon: <Bot size={18} /> },
    { to: '/runs', label: 'Execuções', icon: <ActivitySquare size={18} /> },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <h1>
            Orquestra
          </h1>
          <p>Painel operacional premium</p>
        </div>

        <nav>
          {navItems.map((item) => {
            const isActive = item.to === '/'
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);

            return (
              <Link key={item.to} to={item.to} className={isActive ? 'nav-link active' : 'nav-link'}>
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <strong>Versão 8.0</strong>
          <span className="muted">
            Observabilidade, retry manual, paginação e páginas de detalhe por automação.
          </span>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div className="topbar-user">
            <div className="avatar-circle">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
            <div>
              <strong>{user?.name}</strong>
              <p>{user?.email}</p>
            </div>
          </div>

          <div className="topbar-actions">
            <button className="btn btn-secondary btn-sm icon-inline" type="button" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>

            <button className="btn btn-danger btn-sm icon-inline" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Sair</span>
            </button>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}

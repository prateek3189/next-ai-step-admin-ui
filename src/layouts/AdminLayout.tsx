import {
  Bell,
  BookOpen,
  Calendar,
  ChevronRight,
  CreditCard,
  FileBarChart,
  GraduationCap,
  LayoutGrid,
  Settings,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const nav: {
  to: string;
  label: string;
  end?: boolean;
  Icon: ComponentType<{ size?: number; strokeWidth?: number }>;
}[] = [
  { to: "/", label: "Dashboard", end: true, Icon: LayoutGrid },
  { to: "/trainings", label: "Trainings", Icon: BookOpen },
  { to: "/sessions", label: "Sessions", Icon: Calendar },
  { to: "/enrollments", label: "Enrollments", Icon: Users },
  { to: "/payments", label: "Payments", Icon: CreditCard },
  { to: "/reports", label: "Reports", Icon: FileBarChart },
  { to: "/notifications", label: "Notifications", Icon: Bell },
  { to: "/settings", label: "Settings", Icon: Settings },
];

export function AdminLayout() {
  const { email, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar" aria-label="Main navigation">
        <div className="admin-brand">
          <span className="admin-brand-mark" aria-hidden>
            <GraduationCap size={22} strokeWidth={1.75} />
          </span>
          <div className="admin-brand-text">
            <div className="admin-brand-title-row">
              <span className="admin-brand-title">Training Admin</span>
            </div>
            <div className="admin-brand-sub">Management portal</div>
          </div>
        </div>

        <p className="admin-nav-heading">Menu</p>

        <nav className="admin-nav" aria-label="Primary">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `admin-nav-link${isActive ? " admin-nav-link--active" : ""}`
              }
            >
              <span className="admin-nav-icon-wrap" aria-hidden>
                <item.Icon size={20} strokeWidth={1.75} />
              </span>
              <span className="admin-nav-label">{item.label}</span>
              <ChevronRight
                className="admin-nav-chevron"
                aria-hidden
                size={16}
                strokeWidth={2}
              />
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user" title={email ?? ""}>
            <span className="admin-user-avatar" aria-hidden>
              {email?.charAt(0).toUpperCase() ?? "A"}
            </span>
            <div className="admin-user-meta">
              <span className="admin-user-label">Signed in</span>
              <span className="admin-user-email">{email}</span>
            </div>
          </div>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
          >
            Log out
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
}

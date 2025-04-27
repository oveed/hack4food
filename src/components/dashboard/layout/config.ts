import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'overview', title: 'Dashboard', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'customers', title: 'Etudiants', href: paths.dashboard.customers, icon: 'users' },
  { key: 'settings', title: 'Paramètres', href: paths.dashboard.settings, icon: 'gear-six' },
  { key: 'account', title: 'Compte', href: paths.dashboard.account, icon: 'user' },
] satisfies NavItemConfig[];

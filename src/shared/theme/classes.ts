export const APP_INPUT_CLASS = 'app-input';

export const sidebarNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-blue-600 text-white' : 'app-nav-link',
  ].join(' ');

export const headerNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
    isActive ? 'bg-blue-600 text-white' : 'app-nav-link-header',
  ].join(' ');

import { NavLink } from 'react-router-dom';
import { useAppSettings } from '../i18n.jsx';

const links = [
  { to: '/', labelKey: 'dashboard' },
  { to: '/transports', labelKey: 'transports' },
  { to: '/problems', labelKey: 'problems' },
  { to: '/drivers', labelKey: 'drivers' },
  { to: '/inspections', labelKey: 'inspections' },
  { to: '/reminders', labelKey: 'reminders' },
];

export default function Navbar() {
  const { language, setLanguage, theme, setTheme, t } = useAppSettings();

  return (
    <header className="navbar">
      <NavLink to="/" className="brand" aria-label="AutoControl dashboard">
        <span className="brand-mark">AC</span>
        <span>
          AutoControl
          <small>{t('maintenanceTracking')}</small>
        </span>
      </NavLink>
      <nav className="nav-links" aria-label="Main navigation">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} end={link.to === '/'}>
            {t(link.labelKey)}
          </NavLink>
        ))}
      </nav>
      <div className="nav-controls">
        <button className={language === 'ru' ? 'seg active' : 'seg'} type="button" onClick={() => setLanguage('ru')}>RU</button>
        <button className={language === 'kk' ? 'seg active' : 'seg'} type="button" onClick={() => setLanguage('kk')}>KZ</button>
        <button className="theme-toggle" type="button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          {theme === 'light' ? t('dark') : t('light')}
        </button>
      </div>
    </header>
  );
}

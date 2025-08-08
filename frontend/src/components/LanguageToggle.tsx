import { useTranslation } from 'react-i18next';

/**
 * Simple language selector component. Allows switching between
 * English and German. Extend the options array if you add more
 * languages to i18n resources.
 */
const LanguageToggle: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <select
      value={i18n.language}
      onChange={changeLanguage}
      className="bg-transparent border border-white/20 text-sm text-white rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
    >
      <option value="en" className="text-gray-900">EN</option>
      <option value="de" className="text-gray-900">DE</option>
    </select>
  );
};

export default LanguageToggle;
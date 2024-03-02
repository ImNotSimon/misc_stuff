import { ChatStyleSelection } from '@/components/User/ChatStyleSelection';
import { LanguageDropdownSelection } from './LanguageDropdownSelection';
import { ThemeModeSelection } from './ThemeModeSelection';

export const PreferencesOptions = () => (
  <div className="flex flex-col gap-4">
    <LanguageDropdownSelection />
    <ThemeModeSelection />
    <ChatStyleSelection />
  </div>
);

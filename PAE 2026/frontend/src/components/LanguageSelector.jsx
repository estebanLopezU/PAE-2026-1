import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { useState } from 'react'

const languages = [
  { code: 'es', name: 'Español', flag: '🇨🇴' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
]

export default function LanguageSelector() {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0]

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all duration-300 text-gray-700 border border-gray-300"
      >
        <Globe className="h-4 w-4" />
        <span className="text-sm font-medium">{currentLanguage.flag}</span>
        <span className="text-sm">{currentLanguage.name}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                i18n.language === language.code ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
              }`}
            >
              <span className="text-xl">{language.flag}</span>
              <span className="font-medium">{language.name}</span>
              {i18n.language === language.code && (
                <span className="ml-auto text-primary-600">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
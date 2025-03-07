/**
 * Simplified translation hook - just returns the key as the value
 * This is a replacement for the removed i18n system
 */
export default function useTranslation() {
  // Simple function that returns the key itself
  const t = (key, params = {}) => {
    if (!key) return '';
    
    // Handle params if provided
    let text = key;
    if (params && typeof params === 'object') {
      Object.keys(params).forEach(param => {
        text = text.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
      });
    }
    
    return text;
  };
  
  return {
    t,
    language: 'en'
  };
} 
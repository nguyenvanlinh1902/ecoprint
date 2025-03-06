import React from 'react';
import { FaLanguage } from 'react-icons/fa';
import { useTranslation } from '../hooks';
import TranslationManager from '../components/TranslationManager';
import '../styles/translations-page.scss';

/**
 * Trang quản lý dịch thuật dành cho Admin
 * Cho phép quản lý và cập nhật nội dung đa ngôn ngữ trong hệ thống
 */
const TranslationsAdminPage = () => {
  const { t } = useTranslation();

  return (
    <div className="translations-page">
      <div className="translations-page__header">
        <div className="translations-page__header-icon">
          <FaLanguage />
        </div>
        <div className="translations-page__header-content">
          <h1 className="translations-page__title">
            {t('admin.translations.pageTitle')}
          </h1>
          <p className="translations-page__description">
            {t('admin.translations.pageDescription')}
          </p>
        </div>
      </div>

      <div className="translations-page__intro">
        <div className="alert alert-info">
          <p>
            <strong>{t('admin.translations.helpTitle')}</strong>
            <br />
            {t('admin.translations.helpText')}
          </p>
          <ul>
            <li>{t('admin.translations.helpItem1')}</li>
            <li>{t('admin.translations.helpItem2')}</li>
            <li>{t('admin.translations.helpItem3')}</li>
          </ul>
        </div>
      </div>

      <div className="translations-page__content">
        <TranslationManager />
      </div>
    </div>
  );
};

export default TranslationsAdminPage; 
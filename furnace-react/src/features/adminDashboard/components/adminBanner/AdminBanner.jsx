import React, { useEffect, useState } from 'react';
import { getBanner, setBanner, deleteBanner, BannerBar } from '/src/features/banner';
import { AdminPage, AdminCard, StatusMessage, ui } from '../ui';
import styles from './AdminBanner.module.css';

const MAX_MESSAGE_LENGTH = 500;
const EMPTY_FORM = { message: '', linkText: '', linkUrl: '' };

const formToApi = (form) => ({
  message: form.message.trim(),
  link_text: form.linkText.trim(),
  link_url: form.linkUrl.trim(),
});

const bannerToForm = (banner) => ({
  message: banner.message || '',
  linkText: banner.link_text || '',
  linkUrl: banner.link_url || '',
});

const formatDate = (iso) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
};

/**
 * Admin control for the single home page announcement banner.
 * Publishing saves the form as the live banner (replacing any existing one);
 * removing takes it off the home page entirely.
 */
const AdminBanner = () => {
  const [liveBanner, setLiveBanner] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const loadBanner = async () => {
      try {
        const banner = await getBanner();
        setLiveBanner(banner);
        setForm(banner ? bannerToForm(banner) : EMPTY_FORM);
      } catch (error) {
        setStatus({ type: 'error', text: 'Failed to load the current banner.' });
      } finally {
        setLoading(false);
      }
    };
    loadBanner();
  }, []);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = formToApi(form);

    if (!payload.message) {
      setStatus({ type: 'error', text: 'Enter a message before publishing.' });
      return;
    }

    setSaving(true);
    setStatus(null);
    try {
      const saved = await setBanner(payload);
      setLiveBanner(saved);
      setForm(bannerToForm(saved));
      setStatus({ type: 'success', text: liveBanner ? 'Banner updated.' : 'Banner published to the home page.' });
    } catch (error) {
      setStatus({ type: 'error', text: error.message || 'Failed to save the banner.' });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!window.confirm('Remove the banner from the home page?')) return;

    setSaving(true);
    setStatus(null);
    try {
      await deleteBanner();
      setLiveBanner(null);
      setForm(EMPTY_FORM);
      setStatus({ type: 'success', text: 'Banner removed from the home page.' });
    } catch (error) {
      setStatus({ type: 'error', text: error.message || 'Failed to remove the banner.' });
    } finally {
      setSaving(false);
    }
  };

  const handleRevert = () => {
    setForm(liveBanner ? bannerToForm(liveBanner) : EMPTY_FORM);
    setStatus(null);
  };

  const draft = formToApi(form);
  const hasDraft = draft.message.length > 0;
  const isDirty = liveBanner
    ? draft.message !== liveBanner.message
      || draft.link_text !== (liveBanner.link_text || '')
      || draft.link_url !== (liveBanner.link_url || '')
    : hasDraft || draft.link_text.length > 0 || draft.link_url.length > 0;

  const badge = (
    <span className={`${ui.badge} ${liveBanner ? ui.badgeLive : ui.badgeOff}`}>
      {liveBanner ? 'Live on home page' : 'No banner shown'}
    </span>
  );

  const cardDescription = liveBanner?.updated_at
    ? `Last updated ${formatDate(liveBanner.updated_at)}`
    : 'Nothing is currently shown on the home page.';

  return (
    <AdminPage
      narrow
      title="Home Page Banner"
      description="Show a short notice across the top of the home page, for example “The site is closed today until 2 PM.” Only one banner can be live at a time; publishing replaces whatever is currently shown."
    >
      <AdminCard title="Banner" description={loading ? 'Loading…' : cardDescription} aside={!loading && badge}>
        {!loading && (
          <>
            <div className={ui.sectionLabel}>Preview</div>
            <div className={styles.preview}>
              {hasDraft ? (
                <BannerBar message={draft.message} linkText={draft.link_text} linkUrl={draft.link_url} />
              ) : (
                <div className={styles.previewEmpty}>Type a message below to see how the banner will look.</div>
              )}
            </div>

            <form onSubmit={handleSubmit} className={ui.form}>
              <div className={ui.field}>
                <label className={ui.label} htmlFor="banner-message">Message</label>
                <textarea
                  id="banner-message"
                  className={ui.textarea}
                  value={form.message}
                  onChange={handleChange('message')}
                  placeholder="e.g. The Governor has closed the site until 2 PM today."
                  maxLength={MAX_MESSAGE_LENGTH}
                  rows={3}
                  disabled={saving}
                />
                <span className={styles.charCount}>
                  {form.message.length}/{MAX_MESSAGE_LENGTH}
                </span>
              </div>

              <div className={ui.row}>
                <div className={ui.field}>
                  <label className={ui.label} htmlFor="banner-link-text">Link text (optional)</label>
                  <input
                    id="banner-link-text"
                    className={ui.input}
                    type="text"
                    value={form.linkText}
                    onChange={handleChange('linkText')}
                    placeholder="e.g. See event details"
                    disabled={saving}
                  />
                </div>
                <div className={ui.field}>
                  <label className={ui.label} htmlFor="banner-link-url">Link URL (optional)</label>
                  <input
                    id="banner-link-url"
                    className={ui.input}
                    type="text"
                    value={form.linkUrl}
                    onChange={handleChange('linkUrl')}
                    placeholder="/events or https://…"
                    disabled={saving}
                  />
                </div>
              </div>

              <div className={ui.actions}>
                <button
                  type="submit"
                  className={`${ui.button} ${ui.buttonPrimary}`}
                  disabled={saving || !hasDraft || !isDirty}
                >
                  {liveBanner ? 'Save changes' : 'Publish banner'}
                </button>
                {isDirty && (
                  <button
                    type="button"
                    className={`${ui.button} ${ui.buttonSecondary}`}
                    onClick={handleRevert}
                    disabled={saving}
                  >
                    Discard changes
                  </button>
                )}
                {liveBanner && (
                  <button
                    type="button"
                    className={`${ui.button} ${ui.buttonDanger} ${ui.pushRight}`}
                    onClick={handleRemove}
                    disabled={saving}
                  >
                    Remove banner
                  </button>
                )}
              </div>

              <StatusMessage status={status} />
            </form>
          </>
        )}
        {loading && <StatusMessage status={status} />}
      </AdminCard>
    </AdminPage>
  );
};

export default AdminBanner;

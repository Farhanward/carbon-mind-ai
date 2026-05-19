import { useEffect, useState } from 'react'
import { open } from '@tauri-apps/plugin-dialog'
import { Bot, CheckCircle2, Database, FileText, KeyRound, RefreshCw, Send, ShieldCheck } from 'lucide-react'
import type { AiAnswer, Bootstrap, IntegrationSettings } from './lib/api'
import { api } from './lib/api'
import './App.css'

type Locale = 'ar' | 'en'

const copy = {
  ar: {
    dir: 'rtl',
    language: 'English',
    title: 'CarbonMind AI',
    subtitle: 'مساعد مستندات Windows: PDF وDOCX وTXT، فهرسة محلية، وإجابات مقيدة بمستندات العميل فقط.',
    active: 'مفعل',
    inactive: 'غير مفعل',
    placeholder: 'مفتاح التطوير: CF-DEMO-ALL',
    fingerprint: 'بصمة الجهاز',
    docs: 'المستندات',
    chunks: 'المقاطع',
    model: 'النموذج',
    importText: 'استيراد نص',
    importFile: 'استيراد PDF/DOCX/TXT',
    titleField: 'عنوان المستند',
    content: 'محتوى المستند',
    question: 'اسأل من المستندات فقط',
    ask: 'إرسال',
    settings: 'إعدادات OpenAI',
    openaiModel: 'نموذج OpenAI',
    openaiKey: 'مفتاح OpenAI',
    save: 'حفظ',
    answer: 'الإجابة',
    sources: 'المصادر',
    loading: 'تحميل CarbonMind AI...',
  },
  en: {
    dir: 'ltr',
    language: 'العربية',
    title: 'CarbonMind AI',
    subtitle: 'Windows document assistant: PDF, DOCX, TXT, local retrieval, and answers grounded only in customer documents.',
    active: 'Active',
    inactive: 'Inactive',
    placeholder: 'Development key: CF-DEMO-ALL',
    fingerprint: 'Device fingerprint',
    docs: 'Documents',
    chunks: 'Chunks',
    model: 'Model',
    importText: 'Import text',
    importFile: 'Import PDF/DOCX/TXT',
    titleField: 'Document title',
    content: 'Document content',
    question: 'Ask from documents only',
    ask: 'Send',
    settings: 'OpenAI settings',
    openaiModel: 'OpenAI model',
    openaiKey: 'OpenAI key',
    save: 'Save',
    answer: 'Answer',
    sources: 'Sources',
    loading: 'Loading CarbonMind AI...',
  },
} as const

function App() {
  const [locale, setLocale] = useState<Locale>('ar')
  const [data, setData] = useState<Bootstrap | null>(null)
  const [settings, setSettings] = useState<IntegrationSettings | null>(null)
  const [licenseKey, setLicenseKey] = useState('')
  const [doc, setDoc] = useState({ title: '', content: '', question: '' })
  const [openai, setOpenai] = useState({ openai_model: 'gpt-5-mini', openai_api_key: '' })
  const [answer, setAnswer] = useState<AiAnswer | null>(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const t = copy[locale]

  useEffect(() => {
    api.bootstrap().then(setData).catch((error) => setMessage(String(error)))
    api.settings().then((next) => {
      setSettings(next)
      setOpenai({ openai_model: next.openai_model, openai_api_key: '' })
    }).catch((error) => setMessage(String(error)))
  }, [])

  async function activate() {
    setBusy(true)
    try {
      const license = await api.activateLicense(licenseKey, 'ai')
      setData((current) => current ? { ...current, license } : current)
      setLicenseKey('')
    } catch (error) {
      setMessage(String(error))
    } finally {
      setBusy(false)
    }
  }

  async function importText() {
    setBusy(true)
    try {
      const ai = await api.importText(doc.title, doc.content)
      setData((current) => current ? { ...current, ai } : current)
      setDoc({ ...doc, title: '', content: '' })
    } catch (error) {
      setMessage(String(error))
    } finally {
      setBusy(false)
    }
  }

  async function importFile() {
    const selected = await open({ multiple: false, filters: [{ name: 'Documents', extensions: ['pdf', 'docx', 'txt', 'md', 'csv'] }] })
    if (typeof selected !== 'string') return
    setBusy(true)
    try {
      const ai = await api.importFile(selected)
      setData((current) => current ? { ...current, ai } : current)
    } catch (error) {
      setMessage(String(error))
    } finally {
      setBusy(false)
    }
  }

  async function ask() {
    setBusy(true)
    try {
      setAnswer(await api.askAi(doc.question))
    } catch (error) {
      setMessage(String(error))
    } finally {
      setBusy(false)
    }
  }

  async function saveSettings() {
    const next = await api.saveSettings({
      openai_model: openai.openai_model,
      openai_api_key: openai.openai_api_key,
      supabase_url: settings?.supabase_url ?? '',
      unifonic_sender: settings?.unifonic_sender ?? 'CarbonMind',
      update_channel: settings?.update_channel ?? 'stable',
    })
    setSettings(next)
  }

  if (!data) {
    return <main className="app-shell single" dir={t.dir} lang={locale}><div className="empty-state">{t.loading}</div></main>
  }

  return (
    <main className="app-shell single" dir={t.dir} lang={locale}>
      <section className="workspace">
        <header className="module-header">
          <div className="module-icon"><Bot /></div>
          <div>
            <h2>{t.title}</h2>
            <p>{t.subtitle}</p>
          </div>
          <button onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}>{t.language}</button>
        </header>

        {message && <div className="notice">{message}</div>}

        <article className="license-panel top-license">
          <div className={data.license.active ? 'status status--ok' : 'status'}>
            <ShieldCheck size={18} />
            {data.license.active ? t.active : t.inactive}
          </div>
          <label>{t.fingerprint}<input readOnly value={data.device_fingerprint} /></label>
          <div className="license-row">
            <input value={licenseKey} onChange={(event) => setLicenseKey(event.target.value)} placeholder={t.placeholder} />
            <button onClick={activate} disabled={busy || !licenseKey}><KeyRound size={18} /></button>
          </div>
        </article>

        <div className="metric-grid">
          <Metric label={t.docs} value={String(data.ai.documents)} />
          <Metric label={t.chunks} value={String(data.ai.chunks)} />
          <Metric label={t.model} value={settings?.openai_key_set ? openai.openai_model : 'Local'} />
        </div>

        <div className="split-grid">
          <Panel title={t.importText}>
            <div className="form-grid">
              <input value={doc.title} onChange={(event) => setDoc({ ...doc, title: event.target.value })} placeholder={t.titleField} />
              <textarea value={doc.content} onChange={(event) => setDoc({ ...doc, content: event.target.value })} placeholder={t.content} />
              <button onClick={importText} disabled={busy}><FileText size={18} />{t.importText}</button>
              <button className="dark" onClick={importFile} disabled={busy}><Database size={18} />{t.importFile}</button>
            </div>
          </Panel>
          <Panel title={t.settings}>
            <div className="form-grid">
              <input value={openai.openai_model} onChange={(event) => setOpenai({ ...openai, openai_model: event.target.value })} placeholder={t.openaiModel} />
              <input value={openai.openai_api_key} onChange={(event) => setOpenai({ ...openai, openai_api_key: event.target.value })} placeholder={t.openaiKey} type="password" />
              <button className="dark" onClick={saveSettings} disabled={busy}><CheckCircle2 size={18} />{t.save}</button>
            </div>
          </Panel>
        </div>

        <Panel title={t.question}>
          <div className="form-grid">
            <textarea value={doc.question} onChange={(event) => setDoc({ ...doc, question: event.target.value })} placeholder={t.question} />
            <button className="dark" onClick={ask} disabled={busy}><Send size={18} />{t.ask}</button>
          </div>
          {answer && <div className="answer-box"><strong>{t.answer}</strong><p>{answer.answer}</p><small>{t.sources}: {answer.sources.join(', ') || '-'}</small></div>}
        </Panel>

        <button className="floating-sync" onClick={() => api.bootstrap().then(setData)}><RefreshCw size={18} /></button>
      </section>
    </main>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return <article className="metric"><span>{label}</span><strong>{value}</strong></article>
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <article className="panel"><h3>{title}</h3>{children}</article>
}

export default App

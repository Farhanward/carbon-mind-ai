# تقرير مشروع CarbonMind AI

## ما هو التطبيق؟

CarbonMind AI هو تطبيق Windows مستقل يسمح للعميل باستيراد مستندات PDF وDOCX وTXT، ثم طرح أسئلة تكون إجاباتها مقيدة بمحتوى المستندات فقط.

## كيف يعمل؟

- يعمل كتطبيق سطح مكتب عبر Tauri.
- يستخرج النص من PDF وDOCX وTXT.
- يقسم النص إلى مقاطع ويحفظها محلياً في SQLite.
- يبحث محلياً عن المقاطع الأقرب للسؤال.
- إذا تم حفظ مفتاح OpenAI، يستخدم Responses API لتوليد إجابة من السياق المحدد فقط.
- إذا لم يوجد مفتاح OpenAI، يقدم إجابة محلية مبنية على المقاطع المطابقة.
- الترخيص مرتبط ببصمة جهاز Windows.

## لغة البرمجة والتقنيات

- Frontend: TypeScript + React
- Desktop Backend: Rust + Tauri
- Database: SQLite
- AI: OpenAI Responses API
- Document parsing: PDF/DOCX/TXT extraction in Rust
- Installer: NSIS

## الملفات المهمة

- السورس: `src/`
- كود Rust: `src-tauri/src/main.rs`
- إعداد Tauri: `src-tauri/tauri.conf.json`
- المثبت الجاهز: `release/CarbonMind AI_0.1.0_x64-setup.exe`
- توقيع التحديث: `release/CarbonMind AI_0.1.0_x64-setup.exe.sig`

## نتيجة الفحص

- `npm run build:web`: ناجح
- `npm run lint`: ناجح
- `cargo check`: ناجح
- بناء مثبت Windows: ناجح

## نسبة نجاح التطبيق بعد الفحص

نسبة الجاهزية: 86%

السبب: الاستيراد والفهرسة والبناء تعمل. الإنتاج الكامل يحتاج اختبار ملفات PDF متنوعة، مفتاح OpenAI فعلي، وربط endpoint تحديث حقيقي.

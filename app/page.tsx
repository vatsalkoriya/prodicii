import Link from 'next/link';
import { connect } from '../lib/mongodb';
import Store from '../models/Store';
import Header from '../components/Header';
import Container from '../components/Container';
import { APP_HOST } from '../lib/app-config';

export const revalidate = 60;

const operatingSystem = [
  {
    title: 'Store command center',
    copy: 'Set brand, hero copy, product mix, and payment rails from one editor without touching code.',
    points: ['Theme controls', 'Homepage sections', 'Product resources'],
  },
  {
    title: 'Checkout built for UPI',
    copy: 'A friction-light payment flow with QR, mobile deep links, proof submission, and verification.',
    points: ['QR and app intent', 'Proof upload', 'Status visibility'],
  },
  {
    title: 'Seller operations dashboard',
    copy: 'See stores, orders, attachments, and payment readiness in a layout that feels productized, not patched together.',
    points: ['Store health', 'Order review', 'Subdomain launch'],
  },
];

const workflow = [
  ['Create your store', 'Claim a subdomain, set your UPI, and shape the storefront voice in minutes.'],
  ['Add products and files', 'Upload images, ZIPs, source docs, and external links for digital or proof-heavy products.'],
  ['Share and sell', 'Send a clean storefront link that feels premium on desktop and mobile.'],
  ['Verify with confidence', 'Track orders and confirm UPI submissions from a focused dashboard.'],
];

const featureGrid = [
  ['Digital product ready', 'Sell software drops, templates, service packages, course files, or physical goods from the same stack.'],
  ['Custom domain support', 'Run on your branded domain or launch fast from your subdomain first.'],
  ['Proof-rich products', 'Attach downloadable files and reference links so buyers understand exactly what they get.'],
  ['Admin clarity', 'Orders, products, analytics, and settings live in one opinionated workspace.'],
];

const faqs = [
  ['Can I sell downloadable products?', 'Yes. Products now support image previews, uploaded files up to 5 MB each, and external resource links.'],
  ['Do buyers pay on my UPI ID?', 'Yes. The platform routes checkout to your configured UPI ID or a product-specific UPI ID when provided.'],
  ['Can I start on a subdomain and move later?', 'Yes. You can launch on your subdomain first and switch to a custom domain when ready.'],
];

function ScreenshotCard({
  eyebrow,
  title,
  description,
  children,
  reverse = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <section className="py-14">
      <Container>
        <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
          <div className={`section-fade ${reverse ? 'lg:order-2' : ''}`}>
            <p className="section-label">{eyebrow}</p>
            <h2 className="mt-4 max-w-xl text-4xl font-bold tracking-tight text-white sm:text-5xl" style={{ fontFamily: 'var(--font-display)' }}>
              {title}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">{description}</p>
          </div>
          <div className={`section-fade ${reverse ? 'lg:order-1' : ''}`}>{children}</div>
        </div>
      </Container>
    </section>
  );
}

export default async function HomePage() {
  await connect();
  const stores = await Store.find({ isActive: true })
    .select('name subdomain description logo')
    .limit(6)
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="min-h-screen">
      <Header />
      
      <section className="hero-mesh relative overflow-hidden py-[4.5rem] sm:py-24">
        <div className="ambient-orb absolute left-[-8rem] top-8 h-48 w-48 rounded-full bg-emerald-400/18 blur-3xl" />
        <div className="ambient-orb-delay absolute right-[-4rem] top-20 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <Container>
          <div className="section-fade grid items-end gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>

              <h1
                className="mt-6 max-w-5xl text-5xl font-black leading-[0.9] tracking-[-0.04em] text-white sm:text-6xl lg:text-8xl"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Build a storefront
                <br />
                that feels
                <span className="text-brand"> expensive.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                Launch a polished product site, collect UPI payments directly, attach proof files, and run orders from a seller dashboard that actually looks finished.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/auth/register" className="shine rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-[var(--brand-ink)] transition hover:bg-[#57e3a0]">
                  Launch your store
                </Link>
                <Link href="/dashboard" className="rounded-full border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-semibold text-slate-100 transition hover:border-white/20 hover:bg-white/10">
                  Explore dashboard
                </Link>
              </div>
              <div className="mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ['0%', 'platform commission'],
                  ['5 MB', 'file uploads'],
                  ['UPI', 'native checkout'],
                  ['1 link', 'share-ready storefront'],
                ].map(([value, label]) => (
                  <div key={label} className="data-chip">
                    <p className="text-2xl font-bold text-white">{value}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="section-fade">
              <div className="product-stage rounded-[2rem] p-4 sm:p-5">
                <div className="browser-shell rounded-[1.6rem]">
                  <div className="browser-topbar">
                    <div className="flex items-center gap-2">
                      <span className="browser-dot bg-rose-400" />
                      <span className="browser-dot bg-amber-300" />
                      <span className="browser-dot bg-emerald-400" />
                    </div>
                    <div className="browser-address">https://studio.{APP_HOST}</div>
                    <div className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-brand">Live</div>
                  </div>
                  <div className="grid gap-4 p-4 lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="space-y-4">
                      <div className="dashboard-panel">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Store health</p>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          {[
                            ['12', 'products'],
                            ['94%', 'UPI verified'],
                            ['08', 'orders today'],
                            ['3m', 'setup time'],
                          ].map(([value, label]) => (
                            <div key={label} className="mini-stat">
                              <p className="text-xl font-bold text-white">{value}</p>
                              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="dashboard-panel">
                        <p className="text-sm font-semibold text-white">Recent proof files</p>
                        <div className="mt-3 space-y-2">
                          {['logo-pack.zip', 'catalog-v3.pdf', 'pricing-sheet.xlsx'].map((item) => (
                            <div key={item} className="flex items-center justify-between rounded-2xl border border-white/6 bg-white/4 px-3 py-3">
                              <span className="text-sm text-slate-200">{item}</span>
                              <span className="text-[11px] uppercase tracking-[0.18em] text-brand">ready</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="dashboard-panel flex flex-col justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Storefront preview</p>
                        <div className="mt-4 rounded-[1.5rem] border border-white/8 bg-[linear-gradient(180deg,#0d1a18_0%,#081210_100%)] p-5">
                          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-300">
                            premium digital drop
                          </div>
                          <h3 className="mt-4 text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                            Digital product pages
                            <br />
                            with UPI checkout
                          </h3>
                          <p className="mt-3 max-w-sm text-sm leading-7 text-slate-400">
                            Attach ZIPs, guides, source files, proofs, and external links beside the purchase flow.
                          </p>
                          <div className="mt-6 flex gap-3">
                            <div className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-[var(--brand-ink)]">Buy now</div>
                            <div className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">View files</div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-3">
                        {['Hero', 'Checkout', 'Files'].map((item) => (
                          <div key={item} className="rounded-2xl border border-white/8 bg-white/4 px-3 py-4 text-center text-xs uppercase tracking-[0.18em] text-slate-400">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-8">
        <Container>
          <div className="section-fade grid gap-4 rounded-[2rem] border border-white/8 bg-white/4 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.22)] sm:grid-cols-2 xl:grid-cols-4">
            {operatingSystem.map((item) => (
              <div key={item.title} className="rounded-[1.5rem] border border-white/8 bg-black/10 p-5">
                <p className="text-lg font-semibold text-white">{item.title}</p>
                <p className="mt-3 text-sm leading-7 text-slate-400">{item.copy}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.points.map((point) => (
                    <span key={point} className="pill text-xs">{point}</span>
                  ))}
                </div>
              </div>
            ))}
            <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-400/10 p-5 xl:col-span-1">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Built for launch velocity</p>
              <p className="mt-3 text-3xl font-bold text-white">From zero to storefront in one sitting.</p>
              <p className="mt-3 text-sm leading-7 text-emerald-50/80">The product is opinionated enough to ship fast and flexible enough to grow with digital and service sellers.</p>
            </div>
          </div>
        </Container>
      </section>

      <ScreenshotCard
        eyebrow="Section 3 - Store builder"
        title="Edit your storefront like a real product team, not like filling a template."
        description="Merch, copy, hero treatment, files, and checkout controls live inside a single command surface with sharper hierarchy and better information density."
      >
        <div className="browser-shell rounded-[1.8rem] p-4">
          <div className="browser-topbar">
            <div className="flex items-center gap-2">
              <span className="browser-dot bg-rose-400" />
              <span className="browser-dot bg-amber-300" />
              <span className="browser-dot bg-emerald-400" />
            </div>
            <div className="browser-address">Store Editor</div>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-[240px_1fr]">
            <div className="dashboard-panel space-y-2">
              {['Brand', 'Hero', 'Products', 'Files', 'Payments', 'SEO'].map((item, index) => (
                <div key={item} className={`rounded-2xl px-4 py-3 text-sm ${index === 2 ? 'border border-emerald-400/25 bg-emerald-400/10 text-white' : 'border border-white/6 bg-white/4 text-slate-400'}`}>
                  {item}
                </div>
              ))}
            </div>
            <div className="dashboard-panel">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">Product composition</p>
                  <p className="mt-1 text-sm text-slate-400">Control how product pages, files, and purchase prompts are presented.</p>
                </div>
                <div className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-brand">Autosaved</div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {['Headline block', 'Featured media', 'Downloadables', 'Proof links'].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="text-sm font-semibold text-white">{item}</p>
                    <div className="mt-3 h-2 rounded-full bg-white/8">
                      <div className="h-2 rounded-full bg-brand" style={{ width: item === 'Proof links' ? '78%' : '92%' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ScreenshotCard>

      <ScreenshotCard
        eyebrow="Section 4 - Checkout page"
        title="A cleaner UPI checkout flow with proof submission baked into the page."
        description="The purchase surface makes the payment path obvious: amount, QR, app handoff, and proof submission all sit in one visual flow without looking cobbled together."
      >
        <div className="browser-shell rounded-[1.8rem] p-4">
          <div className="browser-topbar">
            <div className="flex items-center gap-2">
              <span className="browser-dot bg-rose-400" />
              <span className="browser-dot bg-amber-300" />
              <span className="browser-dot bg-emerald-400" />
            </div>
            <div className="browser-address">Checkout</div>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="dashboard-panel">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Order summary</p>
              <div className="mt-4 rounded-[1.5rem] border border-white/8 bg-white/4 p-4">
                <div className="h-40 rounded-[1.25rem] bg-[linear-gradient(135deg,rgba(43,217,133,0.18),rgba(91,196,255,0.12))]" />
                <p className="mt-4 text-xl font-semibold text-white">AI Prompt Bundle</p>
                <p className="mt-1 text-sm text-slate-400">ZIP files, docs, onboarding guide</p>
                <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-4">
                  <span className="text-slate-400">Total</span>
                  <span className="text-2xl font-bold text-brand">Rs 1,499</span>
                </div>
              </div>
            </div>
            <div className="dashboard-panel">
              <div className="grid gap-3 sm:grid-cols-[0.8fr_1.2fr]">
                <div className="rounded-[1.5rem] border border-white/8 bg-white/4 p-4">
                  <div className="grid h-40 place-items-center rounded-[1.25rem] border border-dashed border-white/12 bg-black/15 text-sm text-slate-400">
                    QR preview
                  </div>
                  <div className="mt-3 rounded-full bg-brand px-4 py-2 text-center text-sm font-semibold text-[var(--brand-ink)]">Open UPI app</div>
                </div>
                <div className="space-y-3">
                  <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="text-sm font-semibold text-white">1. Pay on your UPI app</p>
                    <p className="mt-2 text-sm leading-7 text-slate-400">Use the QR or deep-link to complete payment instantly.</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <p className="text-sm font-semibold text-white">2. Submit proof</p>
                    <p className="mt-2 text-sm leading-7 text-slate-400">Add UTR and screenshot so the seller can verify the order fast.</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                    <p className="text-sm font-semibold text-white">3. Get confirmed</p>
                    <p className="mt-2 text-sm leading-7 text-emerald-50/80">The dashboard shows verification state clearly for both sides.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScreenshotCard>

      <ScreenshotCard
        eyebrow="Section 5 - Seller dashboard"
        title="The dashboard turns seller ops into a product surface, not a pile of forms."
        description="Store cards, live readiness, payment state, and product resources are grouped into cards that scan quickly and feel deliberate on both desktop and mobile."
        reverse={true}
      >
        <div className="browser-shell rounded-[1.8rem] p-4">
          <div className="browser-topbar">
            <div className="flex items-center gap-2">
              <span className="browser-dot bg-rose-400" />
              <span className="browser-dot bg-amber-300" />
              <span className="browser-dot bg-emerald-400" />
            </div>
            <div className="browser-address">Seller workspace</div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              ['Aurora Kits', 'payments connected', '7 resources attached'],
              ['Foundry Notes', 'awaiting UPI', '3 resources attached'],
              ['Prompt Forge', 'live on subdomain', '12 resources attached'],
            ].map(([title, status, meta]) => (
              <div key={title} className="dashboard-panel">
                <div className="flex items-center justify-between">
                  <div className="avatar-brand flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold">
                    {title[0]}
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-brand">manage</span>
                </div>
                <p className="mt-4 text-lg font-semibold text-white">{title}</p>
                <p className="mt-1 text-sm text-slate-400">{status}</p>
                <div className="mt-5 grid gap-2">
                  <div className="rounded-2xl border border-white/8 bg-white/4 px-3 py-3 text-sm text-slate-300">{meta}</div>
                  <div className="rounded-2xl border border-white/8 bg-white/4 px-3 py-3 text-sm text-slate-300">Modern theme active</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScreenshotCard>

      <section className="py-14">
        <Container>
          <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="section-fade">
              <p className="section-label">Section 6 - Workflow</p>
              <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl" style={{ fontFamily: 'var(--font-display)' }}>
                Eight screens are useless if the flow still feels slow.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
                The platform is organized around launch speed: create, publish, collect, verify, repeat. That means fewer dead-end settings and clearer next steps.
              </p>
            </div>
            <div className="grid gap-4">
              {workflow.map(([title, copy], index) => (
                <div key={title} className="workflow-step section-fade">
                  <div className="workflow-index">0{index + 1}</div>
                  <div>
                    <p className="text-lg font-semibold text-white">{title}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-400">{copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-14">
        <Container>
          <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="surface rounded-[2rem] p-7 sm:p-8">
              <p className="section-label">Section 7 - Feature set</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {featureGrid.map(([title, copy]) => (
                  <div key={title} className="rounded-[1.6rem] border border-white/8 bg-white/4 p-5">
                    <p className="text-lg font-semibold text-white">{title}</p>
                    <p className="mt-3 text-sm leading-7 text-slate-400">{copy}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              {stores.length > 0 && (
                <div className="surface rounded-[2rem] p-7">
                  <p className="section-label">Live stores</p>
                  <div className="mt-5 space-y-3">
                    {stores.map((s: any) => (
                      <div key={s._id} className="flex items-center justify-between gap-4 rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                        <div className="flex min-w-0 items-center gap-3">
                          {s.logo ? (
                            <img src={s.logo} alt={s.name} className="h-12 w-12 rounded-2xl object-cover" />
                          ) : (
                            <div className="avatar-brand flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold">
                              {s.name[0].toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-white">{s.name}</p>
                            <p className="truncate text-xs uppercase tracking-[0.18em] text-slate-500">{s.subdomain}.{APP_HOST}</p>
                          </div>
                        </div>
                        <Link href={`/${s.subdomain}`} className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-white/20 hover:text-white">
                          Visit
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="surface rounded-[2rem] p-7">
                <p className="section-label">FAQ</p>
                <div className="mt-5 space-y-3">
                  {faqs.map(([question, answer]) => (
                    <div key={question} className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                      <p className="font-semibold text-white">{question}</p>
                      <p className="mt-2 text-sm leading-7 text-slate-400">{answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="cta-shell section-fade rounded-[2.2rem] p-8 sm:p-10 lg:p-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="section-label text-emerald-100/80">Section 8 - Final CTA</p>
                <h2 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl" style={{ fontFamily: 'var(--font-display)' }}>
                  If the storefront is where trust starts, the default should not look generic.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-emerald-50/80">
                  Start with a subdomain, add your products and files, take payments on your UPI ID, and ship a cleaner buying experience without waiting for a custom build.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Link href="/auth/register" className="shine rounded-full bg-white px-7 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-emerald-50">
                  Create your store
                </Link>
                <Link href="/auth/login" className="rounded-full border border-white/20 px-7 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/8">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

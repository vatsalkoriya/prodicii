import Link from 'next/link';
import { connect } from '../lib/mongodb';
import Store from '../models/Store';
import Header from '../components/Header';
import Container from '../components/Container';
import { APP_HOST } from '../lib/app-config';
import { Link000 } from '../components/ui/skiper-ui/skiper40';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { unstable_cache } from 'next/cache';
import dynamic from 'next/dynamic';
import Skiper66FeatureReveal from '../components/Skiper66FeatureReveal';
import Skiper31ScrollStory from '../components/Skiper31ScrollStory';

const Skiper54StoreCarousel = dynamic(() => import('../components/Skiper54StoreCarousel'), {
  ssr: false,
  loading: () => <div className="skiper54-loading" aria-label="Loading storefront showcase" />,
});

export const revalidate = 60;

const getLandingStores = unstable_cache(
  async () => {
    await connect();
    const stores = await Store.find({ isActive: true })
      .select('name subdomain description logo')
      .limit(6)
      .sort({ createdAt: -1 })
      .lean();
    return stores.map((store: any) => ({
      _id: String(store._id),
      name: store.name,
      subdomain: store.subdomain,
      description: store.description || '',
      logo: store.logo || '',
    }));
  },
  ['landing-stores'],
  { revalidate: 60 },
);

const principles = [
  ['01', 'Make it yours', 'A considered home for your products, your voice, and the details customers remember.'],
  ['02', 'Sell simply', 'UPI checkout, payment proof, and delivery resources gathered into one calm flow.'],
  ['03', 'Grow naturally', 'Start with one beautiful link and add the tools your business needs as it moves.'],
];

export default async function HomePage() {
  const stores = await getLandingStores();

  return (
    <div className="editorial-home min-h-screen">
      <Header />
      <main>
        <section className="editorial-hero">
          <Container>
            <div className="editorial-hero-grid">
              <div className="editorial-hero-copy">
                <p className="editorial-kicker"><span /> Independent commerce, made personal</p>
                <h1>Give your<br /><em>best work</em><br />a place to live.</h1>
                <p className="editorial-lede">prodicii is the quietly powerful storefront for makers, sellers, and small teams building something worth choosing.</p>
                <div className="editorial-actions">
                  <Link href="/auth/register" className="editorial-button">Open your store <ArrowUpRight size={16} aria-hidden="true" /></Link>
                  <Link000 href="/dashboard" className="editorial-text-link">See the workspace <span>→</span></Link000>
                </div>
              </div>
              <Skiper54StoreCarousel stores={stores as any[]} />
            </div>
            <div className="editorial-scroll">Scroll to explore <ArrowDown size={15} aria-hidden="true" /></div>
          </Container>
        </section>

        <section className="editorial-intro"><Container>
          <div className="editorial-rule" />
          <div className="editorial-intro-grid">
            <p className="editorial-overline">The prodicii point of view</p>
            <h2>Commerce should feel<br /><em>human</em> before it feels clever.</h2>
            <p className="editorial-body">The best storefronts do more than process a transaction. They create a sense of place. We give you the foundations to make that feeling yours, without the drag of a custom build.</p>
          </div>
        </Container></section>

        <Container><Skiper66FeatureReveal /></Container>

        <Skiper31ScrollStory />

        <section className="editorial-principles"><Container>
          <div className="editorial-section-heading"><p className="editorial-overline">Why prodicii</p><span>Built for the long way round.</span></div>
          <div className="principle-grid">
            {principles.map(([number, title, copy]) => <article key={number} className="principle-card"><span className="principle-number">{number}</span><h3>{title}</h3><p>{copy}</p></article>)}
          </div>
        </Container></section>

        {stores.length > 0 && <section className="editorial-stores"><Container>
          <div className="editorial-section-heading"><p className="editorial-overline">A few good places</p><Link href="/auth/register" className="editorial-text-link">Create yours <span>↗</span></Link></div>
          <div className="store-gallery">
            {stores.map((store: any, index) => <Link href={`/${store.subdomain}`} key={store._id} className={`store-tile store-tile-${index % 3}`}>
              {store.logo ? <img src={store.logo} alt={store.name} /> : <div className="store-tile-mark">{store.name[0].toUpperCase()}</div>}
              <div><h3>{store.name}</h3><p>{store.subdomain}.{APP_HOST}</p></div><span>↗</span>
            </Link>)}
          </div>
        </Container></section>}

        <section className="editorial-cta"><Container>
          <div className="cta-copy"><p className="editorial-overline">Start with what matters</p><h2>Your next chapter<br /><em>starts here.</em></h2></div>
          <Link href="/auth/register" className="editorial-button editorial-button-light">Create your storefront <ArrowUpRight size={16} aria-hidden="true" /></Link>
        </Container></section>
      </main>
      <footer className="editorial-footer"><Container><span>prodicii</span><p>For independent sellers with something to say.</p><span>© 2024</span></Container></footer>
    </div>
  );
}

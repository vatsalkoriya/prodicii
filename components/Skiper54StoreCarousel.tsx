"use client";

import Autoplay from 'embla-carousel-autoplay';
import type { EmblaCarouselType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, ChevronLeft, ChevronRight, Store } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

interface StoreSlide {
  _id: string;
  name: string;
  subdomain: string;
  description?: string;
  logo?: string;
}

export default function Skiper54StoreCarousel({ stores }: { stores: StoreSlide[] }) {
  const slides = stores.length > 0 ? stores : [
    { _id: 'preview', name: 'Your next storefront', subdomain: 'your-store', description: 'A considered place for the work you want to share.' },
    { _id: 'preview-2', name: 'A clearer way to sell', subdomain: 'your-link', description: 'Products, payments, and proof in one calm flow.' },
    { _id: 'preview-3', name: 'Built to be chosen', subdomain: 'your-brand', description: 'Make the first impression feel like you.' },
  ];
  const autoplay = React.useRef(Autoplay({ delay: 3600, stopOnInteraction: true, stopOnMouseEnter: true }));
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center', skipSnaps: false }, [autoplay.current]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = (api: EmblaCarouselType) => setCurrent(api.selectedScrollSnap());
    onSelect(emblaApi);
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  return (
    <section className="skiper54-shell" aria-label="Featured prodicii storefronts">
      <div className="skiper54-heading">
        <div>
          <p className="editorial-overline">See it in motion</p>
          <p className="skiper54-caption">A storefront can be a point of view.</p>
        </div>
        <span>{String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span>
      </div>

      <div className="skiper54-viewport" ref={emblaRef}>
        <div className="skiper54-track">
          {slides.map((slide, index) => {
            const active = current === index;
            return (
              <div className="skiper54-slide" key={slide._id}>
                <motion.div
                  initial={false}
                  animate={{ clipPath: active ? 'inset(0% 0% 0% 0% round 1.4rem)' : 'inset(10% 0% 10% 0% round 1.4rem)' }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className={`skiper54-card ${active ? 'is-active' : ''}`}
                >
                  <div className={`skiper54-card-art skiper54-art-${index % 4}`}>
                    {slide.logo ? <img src={slide.logo} alt="" /> : <Store size={48} strokeWidth={1.1} />}
                    <span className="skiper54-card-index">0{index + 1}</span>
                  </div>
                  <div className="skiper54-card-meta">
                    <div>
                      <p>{slide.name}</p>
                      <span>{slide.description || 'Independent commerce, made personal.'}</span>
                    </div>
                    {slide._id === 'preview' || slide._id.startsWith('preview-') ? (
                      <Link href="/auth/register" aria-label="Create your storefront"><ArrowUpRight size={18} /></Link>
                    ) : (
                      <Link href={`/${slide.subdomain}`} aria-label={`Visit ${slide.name}`}><ArrowUpRight size={18} /></Link>
                    )}
                  </div>
                </motion.div>
                <AnimatePresence mode="wait">
                  {active && <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="skiper54-slide-label">{slide.subdomain}.prodicii</motion.p>}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      <div className="skiper54-controls">
        <div className="skiper54-dots">
          {slides.map((slide, index) => <button key={slide._id} type="button" aria-label={`Go to slide ${index + 1}`} onClick={() => emblaApi?.scrollTo(index)} className={current === index ? 'is-active' : ''} />)}
        </div>
        <div className="skiper54-arrows">
          <button type="button" aria-label="Previous storefront" onClick={() => emblaApi?.scrollPrev()}><ChevronLeft size={17} /></button>
          <button type="button" aria-label="Next storefront" onClick={() => emblaApi?.scrollNext()}><ChevronRight size={17} /></button>
        </div>
      </div>
    </section>
  );
}

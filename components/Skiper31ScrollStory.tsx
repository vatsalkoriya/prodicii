"use client";

import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, CreditCard, Link2, Palette } from 'lucide-react';
import React, { useRef } from 'react';

const words = ['make', 'it', 'yours'];

function Character({ character, index, word, wordIndex, scrollYProgress }: { character: string; index: number; word: string; wordIndex: number; scrollYProgress: any }) {
  const distance = index - (word.length - 1) / 2;
  const start = wordIndex * 0.18;
  const x = useTransform(scrollYProgress, [start, Math.min(start + 0.34, 1)], [distance * 30, 0]);
  const rotate = useTransform(scrollYProgress, [start, Math.min(start + 0.34, 1)], [distance * 16, 0]);

  return <motion.span style={{ x, rotate }} className="skiper31-character">{character}</motion.span>;
}

export default function Skiper31ScrollStory() {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: targetRef, offset: ['start start', 'end end'] });

  return (
    <section ref={targetRef} className="skiper31-section">
      <div className="skiper31-sticky">
        <div className="skiper31-scroll-hint"><ArrowDown size={15} /> Scroll to shape it</div>
        <div className="skiper31-wordmark" aria-label="Make it yours">
          {words.map((word, wordIndex) => (
            <span key={word} className="skiper31-word">
              {word.split('').map((character, index) => <Character key={`${word}-${index}`} character={character} index={index} word={word} wordIndex={wordIndex} scrollYProgress={scrollYProgress} />)}
            </span>
          ))}
        </div>
        <motion.p className="skiper31-copy" style={{ opacity: useTransform(scrollYProgress, [0.25, 0.55], [0.35, 1]) }}>
          One place for the brand, the product, and the payment path to meet.
        </motion.p>
        <div className="skiper31-tools">
          <div><Palette size={17} /> Your visual language</div>
          <div><CreditCard size={17} /> Your payment rail</div>
          <div><Link2 size={17} /> Your shareable link</div>
        </div>
      </div>
    </section>
  );
}

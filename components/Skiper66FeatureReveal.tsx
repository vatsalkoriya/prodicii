"use client";

import { motion } from 'framer-motion';
import { ArrowUpRight, Boxes, CreditCard, Sparkles } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const feature = {
  title: 'A storefront with a point of view.',
  copy: 'Shape the first impression, keep the buying path clear, and give every product a place that feels deliberate.',
};

export default function Skiper66FeatureReveal() {
  return (
    <section className="skiper66-section">
      <div className="skiper66-copy">
        <p className="editorial-overline">Made to be remembered</p>
        <h2>{feature.title}</h2>
        <p>{feature.copy}</p>
        <Link href="/auth/register" className="editorial-text-link">Build your space <ArrowUpRight size={16} /></Link>
      </div>
      <div className="skiper66-frame">
        <div className="skiper66-mask" />
        <motion.div className="skiper66-visual" whileHover={{ scale: 1.035 }} transition={{ duration: 0.5 }}>
          <div className="skiper66-orbit skiper66-orbit-one" />
          <div className="skiper66-orbit skiper66-orbit-two" />
          <div className="skiper66-visual-label">prodicii / studio</div>
          <Sparkles className="skiper66-spark" size={26} />
          <div className="skiper66-stack">
            <div><Boxes size={18} /> Products</div>
            <div><CreditCard size={18} /> UPI checkout</div>
            <div><ArrowUpRight size={18} /> One clear link</div>
          </div>
        </motion.div>
        <div className="skiper66-hover-label">Move at your own pace</div>
      </div>
    </section>
  );
}

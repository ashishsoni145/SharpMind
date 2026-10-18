'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const phrases = ['subject with AI that knows', 'exam with AI that knows', 'concept with AI that knows'];

function useTypewriter() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [visibleLength, setVisibleLength] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const phrase = phrases[phraseIndex];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setVisibleLength(phrase.length);
      return;
    }

    const atEnd = visibleLength === phrase.length;
    const atStart = visibleLength === 0;
    const delay = atEnd && !deleting ? 1800 : deleting ? 35 : 70;
    const timer = window.setTimeout(() => {
      if (atEnd && !deleting) setDeleting(true);
      else if (atStart && deleting) {
        setDeleting(false);
        setPhraseIndex((index) => (index + 1) % phrases.length);
      } else setVisibleLength((length) => length + (deleting ? -1 : 1));
    }, delay);

    return () => window.clearTimeout(timer);
  }, [deleting, phraseIndex, visibleLength]);

  return phrases[phraseIndex].slice(0, visibleLength);
}

const topics = [
  { name: 'Limits', mastery: 88, x: 18, y: 23 },
  { name: 'Vectors', mastery: 61, x: 79, y: 20 },
  { name: 'Integrals', mastery: 74, x: 18, y: 76 },
  { name: 'Kinematics', mastery: 43, x: 81, y: 75 },
  { name: 'Functions', mastery: 95, x: 50, y: 8 },
  { name: 'Diff. Eq.', mastery: 38, x: 50, y: 91 },
];

function KnowledgeModel() {
  return (
    <div className="relative w-full rounded-3xl border border-zinc-800 bg-zinc-950/90 p-5 shadow-2xl shadow-black/60 sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Illustrative preview</p>
          <h2 className="mt-1 text-lg font-semibold text-white">Your knowledge model</h2>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-zinc-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> Live preview
        </span>
      </div>

      <div className="relative mx-auto mt-5 aspect-square w-full max-w-[440px]" aria-label="Illustrative concept mastery map">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden="true">
          {topics.map((topic) => (
            <line key={topic.name} x1="50" y1="50" x2={topic.x} y2={topic.y} stroke="#535353" strokeWidth="0.35" strokeDasharray="1.2 1.2" />
          ))}
        </svg>
        {topics.map((topic) => (
          <button
            key={topic.name}
            type="button"
            title={`${topic.name}: ${topic.mastery}% mastery`}
            aria-label={`${topic.name}, ${topic.mastery}% illustrative mastery`}
            className={`group absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border px-3 py-2 text-xs font-semibold transition duration-200 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${topic.mastery >= 70 ? 'border-white bg-white text-black' : 'border-zinc-600 bg-zinc-900 text-zinc-200'} ${topic.mastery < 60 ? 'animate-pulse' : ''}`}
            style={{ left: `${topic.x}%`, top: `${topic.y}%` }}
          >
            {topic.name}
            <span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-zinc-700 bg-black px-2 py-1 font-mono text-[10px] text-white opacity-0 shadow-xl transition group-hover:opacity-100 group-focus-visible:opacity-100">
              {topic.mastery}% mastery · sample data
            </span>
          </button>
        ))}
        <div className="absolute left-1/2 top-1/2 z-20 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-2 border-white bg-zinc-900 text-center shadow-[0_0_40px_rgba(255,255,255,0.08)]">
          <span className="text-sm font-bold text-white">Calculus</span>
          <span className="mt-1 font-mono text-xs text-zinc-400">92%</span>
        </div>
      </div>

      <div className="mt-2 flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/70 p-3">
        <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-white" />
        <p className="text-xs leading-relaxed text-zinc-300"><span className="font-semibold text-white">Revision due</span> · Differential Equations · Forgetting risk: high</p>
      </div>
      <p className="mt-3 text-center text-[10px] text-zinc-600">Example visualization. Your model is built from your learning evidence.</p>
    </div>
  );
}

export function HeroSection() {
  const typedPhrase = useTypewriter();
  return (
    <section id="top" className="relative isolate overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24 lg:px-8 lg:pt-28" aria-labelledby="hero-heading">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_15%_10%,rgba(255,255,255,0.07),transparent_45%),radial-gradient(ellipse_at_85%_70%,rgba(255,255,255,0.04),transparent_40%)]" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div className="mx-auto w-full max-w-2xl text-center lg:mx-0 lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/70 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300 sm:text-xs">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> AI-powered Academic OS
          </span>
          <h1 id="hero-heading" className="mt-7 font-serif text-5xl font-medium leading-[1.02] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
            Master any <span className="block min-h-[1.05em] text-zinc-300">{typedPhrase}<span className="ml-1 inline-block h-[0.82em] w-[3px] animate-pulse bg-white align-[-0.08em]" aria-hidden="true" /></span>
            <span className="block">how you learn.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg lg:mx-0">
            SharpMind continuously models what you know, what you&apos;ve forgotten, and what you need next — turning goals into evidence-backed learning and exam readiness.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
            <Link href={`${process.env.NEXT_PUBLIC_APP_URL || 'https://app.sharpmind.live'}/signup`} className="btn-brilliant-primary min-h-12 px-6 py-3 text-sm">Get started free <span aria-hidden="true">→</span></Link>
            <Link href="#how" className="btn-brilliant-secondary min-h-12 px-6 py-3 text-sm">See how it works</Link>
          </div>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
            <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Built for</span>
            {['CBSE 11–12', 'JEE', 'NEET', 'ICSE'].map((tag) => <span key={tag} className="rounded-full border border-zinc-800 bg-zinc-950/70 px-3 py-1.5 text-xs text-zinc-300 transition hover:-translate-y-0.5 hover:border-zinc-600">{tag}</span>)}
          </div>
        </div>
        <KnowledgeModel />
      </div>
    </section>
  );
}

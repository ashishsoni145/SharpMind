'use client';

import { useState } from 'react';

const questions = [
  {
    question: 'Who is SharpMind for?',
    answer: 'SharpMind is built for students preparing for CBSE and ICSE school exams, JEE, and NEET. Your subjects and study plan are tailored during onboarding.',
  },
  {
    question: 'Is it free to start?',
    answer: 'Create an account to explore SharpMind. Current plan options and feature limits are shown in the app before you choose to upgrade.',
  },
  {
    question: 'Does the AI tutor just give answers?',
    answer: 'The tutor is designed to guide your reasoning with questions, explanations, and hints so you can build understanding instead of copying an answer.',
  },
  {
    question: 'How is it different from a question bank?',
    answer: 'SharpMind connects practice to your learning evidence. Your results update a personal knowledge model that informs what to learn and revise next.',
  },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8" aria-labelledby="faq-title">
      <div className="mx-auto max-w-3xl">
        <p className="text-center font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">Questions, answered</p>
        <h2 id="faq-title" className="mt-4 text-center font-serif text-4xl tracking-tight text-white sm:text-5xl">A clearer way to learn.</h2>
        <div className="mt-10 divide-y divide-zinc-800 border-y border-zinc-800">
          {questions.map((item, index) => {
            const expanded = open === index;
            const answerId = `faq-answer-${index}`;
            return (
              <article key={item.question} className={`transition-colors ${expanded ? 'bg-zinc-950/70' : ''}`}>
                <h3>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-5 px-4 py-5 text-left text-base font-medium text-white transition hover:text-zinc-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white sm:px-6 sm:py-6 sm:text-lg"
                    aria-expanded={expanded}
                    aria-controls={answerId}
                    onClick={() => setOpen(expanded ? null : index)}
                  >
                    {item.question}
                    <span aria-hidden="true" className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border border-zinc-700 text-xl transition-transform duration-200 ${expanded ? 'rotate-45' : ''}`}>+</span>
                  </button>
                </h3>
                <div
                  id={answerId}
                  aria-hidden={!expanded}
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ${expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                >
                  <div className="overflow-hidden">
                    <p className="px-4 pb-6 pr-14 text-sm leading-7 text-zinc-400 sm:px-6 sm:pr-20">{item.answer}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

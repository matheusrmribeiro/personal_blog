import type { Metadata } from 'next';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';

export const metadata: Metadata = {
  title: 'About',
  description: 'About the writer behind The Workbench.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto grid max-w-6xl gap-14 px-6 py-16 md:grid-cols-[0.7fr_1.3fr] md:px-10 md:py-24">
        <div>
          <p className="eyebrow">About this place</p>
          <div className="mt-8 aspect-square max-w-sm bg-ink" />
        </div>
        <div className="max-w-2xl md:pt-14">
          <h1 className="text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">
            Hello, I’m the person behind The Workbench.
          </h1>
          <div className="mt-8 space-y-6 text-lg leading-8 text-muted">
            <p>
              This is where I share what I’m learning while designing and
              building software: the experiments that worked, the ones that
              didn’t, and the questions worth carrying forward.
            </p>
            <p>
              The goal is simple—publish useful, honest notes for people who
              care about thoughtful digital work.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

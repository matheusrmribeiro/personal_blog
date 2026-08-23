import type { Metadata } from 'next';
import Image from 'next/image';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { ExpandableImage } from '@/components/ui/expandable-image';
import { getSupabaseConfig } from '@/lib/supabase/config';

export const metadata: Metadata = {
  title: 'About',
  description: 'About the writer behind Workbench Notes.',
};

export default function AboutPage() {
  const { supabaseUrl } = getSupabaseConfig();
  const profileImageUrl = `${supabaseUrl}/storage/v1/object/public/post-images/about/profile-picture.jpg`;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto grid max-w-6xl gap-14 px-6 py-16 md:grid-cols-[0.7fr_1.3fr] md:px-10 md:py-24">
        <div>
          <p className="eyebrow">About this place</p>
          <ExpandableImage
            src={profileImageUrl}
            alt="Portrait of the author by a mountain lake"
            className="mt-8 aspect-square max-w-sm rounded-2xl bg-ink"
          >
            <Image
              src={profileImageUrl}
              alt="Portrait of the author by a mountain lake"
              fill
              preload
              sizes="(min-width: 768px) 24rem, calc(100vw - 3rem)"
              className="object-cover"
            />
          </ExpandableImage>
        </div>
        <div className="max-w-2xl md:pt-14">
          <h1 className="text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">
            Hello, I’m Matt, the person behind Workbench Notes.
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

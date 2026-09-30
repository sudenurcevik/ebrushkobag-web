import type { Metadata } from 'next';
import { YarnGallery } from '@/components/yarn-gallery/YarnGallery';

/**
 * Design experiment — a 3D yarn running down through the four seasons, the
 * bags hanging around it on film-frame cards. Independent of the main site
 * and of the other gallery experiments: deleting this folder,
 * components/yarn-gallery and data/yarn-gallery.ts removes it.
 */
export const metadata: Metadata = {
  title: 'İplik Galerisi',
  robots: { index: false, follow: false },
};

export default function YarnGalleryPage() {
  return <YarnGallery />;
}

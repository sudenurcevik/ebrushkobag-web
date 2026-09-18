import { assetManifestMarkdown } from '@/lib/asset-manifest-markdown';

/** Serves the manifest as markdown so `npm run assets:manifest` can write the doc. */
export async function GET() {
  return new Response(assetManifestMarkdown(), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}

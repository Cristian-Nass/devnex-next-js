/**
 * Types and metadata used only by the editor (web-builder). The viewer never
 * needs these. Importing from `@netmart/builder-core/editor` keeps the
 * viewer's bundle clean.
 */

import type { BlockType } from './types';

export type ProvisioningType = 'SUBDOMAIN' | 'CUSTOM_DOMAIN';

export type PropFieldType = 'text' | 'textarea' | 'url' | 'color' | 'select';

export interface PropField {
  key: string;
  label: string;
  type: PropFieldType;
  options?: Array<{ value: string; label: string }>;
}

export interface SiteSummary {
  id: string;
  name: string;
  slug: string;
  published: boolean;
  provisioningType: ProvisioningType;
  customDomain: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Site extends SiteSummary {
  data: import('./types').SiteData;
  metaTitle: string | null;
  metaDescription: string | null;
  gtmContainerId: string | null;
  cloudflareDnsRecordId?: string | null;
}

/** Default props inserted when a block is first added to a page. */
export const BLOCK_DEFAULTS: Record<BlockType, Record<string, unknown>> = {
  hero: {
    heading: 'Welcome',
    subheading: 'Your subtitle here',
    ctaLabel: 'Get started',
    ctaHref: '#',
    bgColor: '#1e293b',
    textColor: '#ffffff',
  },
  card: { title: 'Card Title', body: 'Card content goes here.' },
  text: { content: 'Write your content here...', align: 'left' },
  image: { src: '', alt: 'Image', caption: '' },
  cta: { label: 'Click Here', href: '#', variant: 'primary' },
};

export const BLOCK_LABELS: Record<BlockType, string> = {
  hero: 'Hero',
  card: 'Card',
  text: 'Text',
  image: 'Image',
  cta: 'Call to Action',
};

export const BLOCK_ICONS: Record<BlockType, string> = {
  hero: '⭐',
  card: '🃏',
  text: '📝',
  image: '🖼️',
  cta: '🔗',
};

/** Schema driving the editor's properties panel (PropsPanel.tsx). */
export const BLOCK_PROP_SCHEMA: Record<BlockType, PropField[]> = {
  hero: [
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'subheading', label: 'Subheading', type: 'textarea' },
    { key: 'ctaLabel', label: 'Button Label', type: 'text' },
    { key: 'ctaHref', label: 'Button URL', type: 'url' },
    { key: 'bgColor', label: 'Background Color', type: 'color' },
    { key: 'textColor', label: 'Text Color', type: 'color' },
  ],
  card: [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'body', label: 'Body', type: 'textarea' },
    { key: 'imageUrl', label: 'Image URL', type: 'url' },
  ],
  text: [
    { key: 'content', label: 'Content', type: 'textarea' },
    {
      key: 'align',
      label: 'Alignment',
      type: 'select',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
    },
  ],
  image: [
    { key: 'src', label: 'Image URL', type: 'url' },
    { key: 'alt', label: 'Alt Text', type: 'text' },
    { key: 'caption', label: 'Caption', type: 'text' },
  ],
  cta: [
    { key: 'label', label: 'Label', type: 'text' },
    { key: 'href', label: 'URL', type: 'url' },
    {
      key: 'variant',
      label: 'Style',
      type: 'select',
      options: [
        { value: 'primary', label: 'Primary' },
        { value: 'secondary', label: 'Secondary' },
        { value: 'outline', label: 'Outline' },
      ],
    },
  ],
};

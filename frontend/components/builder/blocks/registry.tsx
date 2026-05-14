import type { BlockType, PropField } from '@/lib/site-types';
import { CardBlock } from './CardBlock';
import { CtaBlock } from './CtaBlock';
import { HeroBlock } from './HeroBlock';
import { ImageBlock } from './ImageBlock';
import { TextBlock } from './TextBlock';

export const BLOCK_REGISTRY: Record<
  BlockType,
  React.ComponentType<Record<string, unknown>>
> = {
  hero: HeroBlock as React.ComponentType<Record<string, unknown>>,
  card: CardBlock as React.ComponentType<Record<string, unknown>>,
  text: TextBlock as React.ComponentType<Record<string, unknown>>,
  image: ImageBlock as React.ComponentType<Record<string, unknown>>,
  cta: CtaBlock as React.ComponentType<Record<string, unknown>>,
};

export const BLOCK_DEFAULTS: Record<BlockType, Record<string, unknown>> = {
  hero: {
    heading: 'Welcome',
    subheading: 'Your subtitle here',
    ctaLabel: 'Get started',
    ctaHref: '#',
    bgColor: '#1e293b',
    textColor: '#ffffff',
  },
  card: { title: 'Card Title', body: 'Card content goes here.', bgColor: '#ffffff' },
  text: { content: 'Write your content here...', align: 'left', bgColor: '#ffffff' },
  image: { src: '', alt: 'Image', caption: '', bgColor: '#f8fafc' },
  cta: { label: 'Click Here', href: '#', variant: 'primary', bgColor: '#ffffff' },
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
    { key: 'bgColor', label: 'Background Color', type: 'color' },
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
    { key: 'bgColor', label: 'Background Color', type: 'color' },
  ],
  image: [
    { key: 'src', label: 'Image URL', type: 'url' },
    { key: 'alt', label: 'Alt Text', type: 'text' },
    { key: 'caption', label: 'Caption', type: 'text' },
    { key: 'bgColor', label: 'Background Color', type: 'color' },
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
    { key: 'bgColor', label: 'Background Color', type: 'color' },
  ],
};

interface BlockRendererProps {
  type: BlockType;
  props: Record<string, unknown>;
}

export function BlockRenderer({ type, props }: BlockRendererProps) {
  const Component = BLOCK_REGISTRY[type];
  if (!Component) return null;
  return <Component {...props} />;
}

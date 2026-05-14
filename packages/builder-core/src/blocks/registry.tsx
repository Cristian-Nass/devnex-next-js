import type { BlockType } from '../types';
import { CardBlock } from './CardBlock';
import { CtaBlock } from './CtaBlock';
import { HeroBlock } from './HeroBlock';
import { ImageBlock } from './ImageBlock';
import { TextBlock } from './TextBlock';

/**
 * Single source of truth: any new block type must register a component here
 * AND add metadata in `editor-types.ts` (BLOCK_DEFAULTS, BLOCK_LABELS,
 * BLOCK_PROP_SCHEMA) so the editor can render it.
 */
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

interface BlockRendererProps {
  type: BlockType;
  props: Record<string, unknown>;
}

export function BlockRenderer({ type, props }: BlockRendererProps) {
  const Component = BLOCK_REGISTRY[type];
  if (!Component) return null;
  return <Component {...props} />;
}

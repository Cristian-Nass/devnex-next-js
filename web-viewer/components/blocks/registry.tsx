import type { BlockType } from '@/lib/site-types';
import { HeroBlock } from './HeroBlock';
import { TextBlock } from './TextBlock';
import { CardBlock } from './CardBlock';
import { ImageBlock } from './ImageBlock';
import { CtaBlock } from './CtaBlock';

const BLOCK_REGISTRY: Record<string, React.ComponentType<Record<string, unknown>>> = {
  hero: HeroBlock as React.ComponentType<Record<string, unknown>>,
  card: CardBlock as React.ComponentType<Record<string, unknown>>,
  text: TextBlock as React.ComponentType<Record<string, unknown>>,
  image: ImageBlock as React.ComponentType<Record<string, unknown>>,
  cta: CtaBlock as React.ComponentType<Record<string, unknown>>,
};

export function BlockRenderer({
  type,
  props,
}: {
  type: BlockType;
  props: Record<string, unknown>;
}) {
  const Component = BLOCK_REGISTRY[type];
  if (!Component) {
    return (
      <div
        style={{ padding: 12, background: '#fef3c7', borderRadius: 8, fontSize: '0.875rem' }}
      >
        Unknown block: {type}
      </div>
    );
  }
  return <Component {...props} />;
}

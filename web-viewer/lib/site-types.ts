export type SiteHead = {
  title: string;
  description?: string;
  gtmContainerId?: string;
};

export type SitePayload = {
  siteId: string;
  tenantKey: string;
  head: SiteHead;
  data: SiteData;
};

export type BlockType = 'hero' | 'card' | 'text' | 'image' | 'cta';

export interface Block {
  blockId: string;
  type: BlockType;
  colSpan: number;
  props: Record<string, unknown>;
}

export interface Row {
  rowId: string;
  blocks: Block[];
}

export interface Page {
  pageId: string;
  slug: string;
  label: string;
  rows: Row[];
}

export interface Theme {
  primaryColor: string;
  fontFamily: string;
}

export interface SiteData {
  theme: Theme;
  pages: Page[];
}

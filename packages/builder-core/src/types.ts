/**
 * Runtime types shared by the editor and the public viewer. These describe
 * the JSON shape that lives in `Site.data` in the builder database and gets
 * rendered by `PageRenderer`.
 */

export type BlockType = 'hero' | 'card' | 'image' | 'text' | 'cta';

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

export interface NavigationBar {
  backgroundColor: string;
  textColor: string;
}

export interface SiteData {
  theme: Theme;
  pages: Page[];
  navigationBar?: NavigationBar;
}

/**
 * Response shape of the builder's public `GET /api/sites/public/by-host/:hostname`
 * endpoint — what web-viewer consumes to render a published site.
 */
export interface SiteHead {
  title: string;
  description?: string;
  gtmContainerId?: string;
}

export interface SitePayload {
  siteId: string;
  tenantKey: string;
  head: SiteHead;
  data: SiteData;
}

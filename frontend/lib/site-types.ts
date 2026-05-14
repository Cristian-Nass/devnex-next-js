export type ProvisioningType = 'SUBDOMAIN' | 'CUSTOM_DOMAIN';

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
  buttonColor: string;
}

export interface SiteData {
  theme: Theme;
  pages: Page[];
  navigationBar?: NavigationBar;
}

export interface Site {
  id: string;
  name: string;
  slug: string;
  data: SiteData;
  published: boolean;
  provisioningType: ProvisioningType;
  customDomain: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  gtmContainerId: string | null;
  cloudflareDnsRecordId?: string | null;
  createdAt: string;
  updatedAt: string;
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

export type PropFieldType = 'text' | 'textarea' | 'url' | 'color' | 'select';

export interface PropField {
  key: string;
  label: string;
  type: PropFieldType;
  options?: Array<{ value: string; label: string }>;
}

export interface NavItem {
  title: string;
  url: string;
  disabled?: boolean;
  external?: boolean;
  shortcut?: [string, string];
  icon?: any;
  label?: string;
  description?: string;
  isActive?: boolean;
  items?: NavItem[];
}

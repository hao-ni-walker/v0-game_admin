import { NavItem } from '@/types/nav';
import { navList } from '@/constants/router';

export type BreadcrumbItem = {
  title: string;
  link: string;
};

function findParentNav(
  items: NavItem[],
  targetPath: string,
  parentPath = ''
): NavItem | null {
  for (const item of items) {
    const currentPath = item.url === '#' ? parentPath : item.url;

    if (item.items?.some((subItem) => subItem.url === targetPath)) {
      return item;
    }

    if (item.items?.length) {
      const found = findParentNav(item.items, targetPath, currentPath);
      if (found) return found;
    }
  }
  return null;
}

export const getBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];
  const addedPaths = new Set<string>();

  // 始终添加工作台作为第一个面包屑项
  breadcrumbs.push({
    title: '工作台',
    link: '/dashboard/overview'
  });
  addedPaths.add('/dashboard/overview');

  let currentPath = '';
  paths.forEach((path, index) => {
    currentPath += `/${path}`;

    const matchedNav = findNavItem(navList, currentPath);
    if (matchedNav) {
      const parentNav = findParentNav(navList, currentPath);
      if (
        parentNav &&
        parentNav.url !== '#' &&
        !addedPaths.has(parentNav.url)
      ) {
        breadcrumbs.push({
          title: parentNav.title,
          link: parentNav.url
        });
        addedPaths.add(parentNav.url);
      }

      if (!addedPaths.has(matchedNav.url)) {
        breadcrumbs.push({
          title: matchedNav.title,
          link: matchedNav.url
        });
        addedPaths.add(matchedNav.url);
      }
    }
  });

  return breadcrumbs;
};

function findNavItem(items: NavItem[], path: string): NavItem | undefined {
  for (const item of items) {
    if (item.url === path) {
      return item;
    }
    if (item.items?.length) {
      const found = findNavItem(item.items, path);
      if (found) return found;
    }
  }
  return undefined;
}

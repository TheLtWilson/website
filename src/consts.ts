export type Site = {
  TITLE: string
  DESCRIPTION: string
  EMAIL: string
  NUM_POSTS_ON_HOMEPAGE: number
  POSTS_PER_PAGE: number
  SITEURL: string
}

export type Link = {
  href: string
  label: string
}

export const SITE: Site = {
  TITLE: 'Lt. Wilson',
  DESCRIPTION:
    'Personal website of a guy that edits videos and occasionally dabbles in coding projects.',
  EMAIL: 'contact@ltwilson.tv',
  NUM_POSTS_ON_HOMEPAGE: 3,
  POSTS_PER_PAGE: 8,
  SITEURL: 'https://ltwilson.tv',
}

export const NAV_LINKS: Link[] = [
  { href: 'https://streamelements.com/theltwilson/tip', label: 'donate' },
  { href: '/blog', label: 'blog' },
  { href: 'https://shop.ltwilson.tv', label: 'shop' },
]

export const FOOTER_LINKS: Link[] = [
  { href: 'contact@ltwilson.tv', label: 'Email' },
  { href: '/rss.xml', label: 'RSS' },
]

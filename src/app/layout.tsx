import type { Metadata, Viewport } from 'next';
import './globals.css';

const siteUrl = 'https://mandalart.minlabs.site';
const siteName = '만다라트';
const siteTitle = '만다라트 - 목표 달성을 위한 9x9 플래너';
const siteDescription =
  '오타니 쇼헤이가 사용한 만다라트 기법으로 당신의 꿈을 실현하세요. 9x9 그리드에 핵심 목표와 8개의 세부 목표를 작성하고, 각 세부 목표를 다시 8개의 실천 항목으로 구체화합니다. 무료로 만다라트를 작성하고 이미지로 저장하세요.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: '%s | 만다라트',
  },
  description: siteDescription,
  keywords: [
    '만다라트',
    'mandal-art',
    '목표 설정',
    '목표 달성',
    '오타니 쇼헤이',
    '자기계발',
    '플래너',
    '신년 목표',
    '버킷리스트',
    '9x9 그리드',
    '마인드맵',
    '목표 관리',
  ],
  authors: [{ name: 'MinLabs' }],
  creator: 'MinLabs',
  publisher: 'MinLabs',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  verification: {
    google: 'MPJI7yzx4Omu10mFFyrLwyL9SkPN9aEmvP1mlX0bgWk',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: siteUrl,
    siteName: siteName,
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '만다라트 - 9x9 목표 달성 플래너',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: siteName,
  description: siteDescription,
  url: siteUrl,
  applicationCategory: 'ProductivityApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'KRW',
  },
  author: {
    '@type': 'Organization',
    name: 'MinLabs',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '150',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased overflow-x-hidden">{children}</body>
    </html>
  );
}

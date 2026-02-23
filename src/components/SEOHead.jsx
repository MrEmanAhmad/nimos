import { Helmet } from 'react-helmet-async'
import { siteInfo } from '../data/siteInfo'

const BASE_URL = 'https://nimos.emanahmad.cloud'
const OG_IMAGE = `${BASE_URL}/images/og-banner.png`
const OG_IMAGE_LOGO = `${BASE_URL}/images/logo.png`

const restaurantSchema = {
  '@context': 'https://schema.org',
  '@type': ['Restaurant', 'LocalBusiness'],
  '@id': `${BASE_URL}/#restaurant`,
  name: siteInfo.name,
  image: OG_IMAGE_LOGO,
  url: BASE_URL,
  telephone: siteInfo.phone,
  address: {
    '@type': 'PostalAddress',
    streetAddress: siteInfo.address.street,
    addressLocality: 'Knocklong',
    addressRegion: siteInfo.address.area,
    postalCode: siteInfo.address.eircode,
    addressCountry: siteInfo.address.country,
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: siteInfo.geo.lat,
    longitude: siteInfo.geo.lng,
  },
  sameAs: [
    siteInfo.social.facebook,
    siteInfo.social.instagram,
    siteInfo.social.tiktok,
  ],
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Thursday', 'Friday', 'Saturday'],
      opens: '15:00',
      closes: '22:30',
      description: 'Delivery & Pickup',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Sunday'],
      opens: '15:00',
      closes: '22:00',
      description: 'Delivery & Pickup',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday'],
      opens: '15:00',
      closes: '22:30',
      description: 'Pickup only',
    },
  ],
  servesCuisine: ['Pizza', 'Burgers', 'Kebabs', 'Fish & Chips', 'Chicken', 'Fast Food', 'Takeaway'],
  priceRange: '€€',
  menu: `${BASE_URL}/menu`,
  acceptsReservations: false,
  currenciesAccepted: 'EUR',
  paymentAccepted: 'Cash, Credit Card',
  areaServed: [
    { '@type': 'City', name: 'Knocklong' },
    { '@type': 'City', name: 'Hospital' },
    { '@type': 'City', name: 'Kilmallock' },
    { '@type': 'City', name: 'Bruff' },
    { '@type': 'City', name: 'Limerick' },
  ],
  hasMenu: {
    '@type': 'Menu',
    name: "Nimo's Full Menu",
    url: `${BASE_URL}/menu`,
    hasMenuSection: [
      { '@type': 'MenuSection', name: 'Pizzas' },
      { '@type': 'MenuSection', name: 'Burgers' },
      { '@type': 'MenuSection', name: 'Kebabs' },
      { '@type': 'MenuSection', name: 'Chicken' },
      { '@type': 'MenuSection', name: 'Wraps' },
      { '@type': 'MenuSection', name: 'Sides & Chips' },
    ],
  },
}

export function generateBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url ? `${BASE_URL}${item.url}` : undefined,
    })),
  }
}

export default function SEOHead({ title, description, keywords, path = '/', breadcrumbs, extraSchema }) {
  const canonicalUrl = `${BASE_URL}${path}`
  const fullTitle = title ? `${title} | Nimo's Limerick` : "Nimo's Limerick | Pizza, Burgers & Takeaway Knocklong"

  const breadcrumbSchema = breadcrumbs
    ? generateBreadcrumbSchema(breadcrumbs)
    : null

  return (
    <Helmet>
      {/* Core */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />
      <meta name="geo.region" content="IE-LK" />
      <meta name="geo.placename" content="Knocklong, Co. Limerick" />
      <meta name="geo.position" content="52.4631;-8.5672" />
      <meta name="ICBM" content="52.4631, -8.5672" />

      {/* OpenGraph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Nimo's Limerick - Pizza, Burgers & Kebabs Takeaway in Knocklong" />
      <meta property="og:locale" content="en_IE" />
      <meta property="og:site_name" content="Nimo's Limerick" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE} />

      {/* JSON-LD: Restaurant */}
      <script type="application/ld+json">
        {JSON.stringify(restaurantSchema)}
      </script>

      {/* JSON-LD: Breadcrumbs (if provided) */}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}

      {/* JSON-LD: Extra schema (if provided) */}
      {extraSchema && (
        <script type="application/ld+json">
          {JSON.stringify(extraSchema)}
        </script>
      )}
    </Helmet>
  )
}

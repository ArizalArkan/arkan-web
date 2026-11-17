import type { Quest } from './schema';

// Every quest is a real product from the owner's CV. Solution bullets are the
// CV bullets with wording tightened. `problem` restates the context those
// bullets describe; `outcome` is only filled where the CV states a result.
// TODO(owner): confirm each `rank`, and supply measurable outcomes where null.
export const quests: Quest[] = [
  {
    id: 'bank-saqu',
    title: 'Bank Saqu',
    tagline: 'Smart Digital Banking Platform',
    year: 2025,
    period: '2025 to now',
    role: 'Senior Frontend Engineer and Middle Mobile Engineer at Astra Financial',
    rank: 'S',
    summary:
      'Payment operations dashboard and a React Native banking app covering biller payments, QRIS, transfers and virtual accounts.',
    problem:
      'Bank Saqu needs two things kept healthy at once: the internal dashboard its payment operations team uses day to day, and the mobile app customers pay with.',
    solution: [
      'Maintain and enhance the internal operational payment dashboard in React.js, supporting day-to-day payment operations.',
      'Migrated legacy components to a shared design system.',
      'Develop and maintain the React Native mobile app, handling the core payment features: biller and bill payments, QRIS, transfers and virtual accounts (VA).',
      'Work closely with the design team so the implementation matches the Figma specifications pixel for pixel.',
    ],
    outcome:
      'The design system migration improved code consistency and reduced technical debt across the application.',
    stack: ['react', 'react-native'],
    tags: ['Design system'],
    links: [
      {
        kind: 'demo',
        label: 'Get Bank Saqu on Google Play',
        href: 'https://play.google.com/store/apps/details?id=bjj.bank.digital.indo.prod&hl=id',
      },
    ],
    media: [
      {
        src: '/assets/banksaqu.webp',
        alt: 'Bank Saqu product preview',
        width: 960,
        height: 503,
      },
    ],
    featured: true,
  },
  {
    id: 'altaraone',
    title: 'AltaraOne',
    tagline: 'Digital Audit and Business Process Management Platform',
    year: 2025,
    period: '2025',
    role: 'Lead Frontend Engineer (freelance)',
    rank: 'S',
    summary:
      'Led the frontend architecture from scratch, building a scalable Next.js codebase on an Atomic Design system.',
    problem:
      'A new audit and business process platform had no frontend yet. It needed an architecture and a design system that could carry complex audit workflows as the codebase and the team grew.',
    solution: [
      'Built the web application from scratch with Next.js, establishing a scalable, maintainable frontend architecture and an Atomic Design system.',
      'Own the frontend architecture end to end, keeping code quality and maintainability as the codebase and team scale.',
      'Lead and manage task distribution across the frontend team, balancing workload and unblocking delivery on complex audit workflows.',
      'Worked closely with product managers, designers and backend engineers to turn business requirements into technical solutions.',
    ],
    outcome: null,
    stack: ['nextjs'],
    tags: ['Atomic Design', 'Team lead'],
    links: [],
    media: [
      {
        src: '/assets/altaraone.webp',
        alt: 'AltaraOne product preview',
        width: 960,
        height: 524,
      },
    ],
    featured: true,
  },
  {
    id: 'ruparupa',
    title: 'Ruparupa.com',
    tagline: 'No.1 Home, Living and Furniture E-commerce in Indonesia',
    year: 2022,
    period: '2022 to 2025',
    role: 'Middle, then Senior Frontend Engineer at Kawan Lama Group',
    rank: 'A',
    summary:
      'Product detail pages, order management dashboards, and secure Express and Nest middleware protecting sensitive data.',
    problem:
      'Ruparupa.com sells home and furniture products online. Designs and wireframes had to become a responsive storefront, and sensitive data moving through it had to stay protected.',
    solution: [
      'Turned designs and wireframes into a fully functional, responsive e-commerce web application with Next.js.',
      'Developed key features, including self-care portals and campaign-specific functionality.',
      'Developed and maintained Product Detail Pages (PDP) and order management dashboards.',
      'Built secure middleware integrations with Express.js and Nest.js to protect sensitive data.',
      'Refactored legacy code for performance, scalability and long-term maintainability.',
    ],
    outcome: null,
    stack: ['nextjs', 'express', 'nestjs'],
    tags: ['E-commerce'],
    links: [{ kind: 'demo', label: 'Visit ruparupa.com', href: 'https://www.ruparupa.com/' }],
    media: [
      {
        src: '/assets/ruparupacom.webp',
        alt: 'Ruparupa.com product preview',
        width: 960,
        height: 524,
      },
    ],
    featured: true,
  },
  {
    id: 'vision-plus',
    title: 'Vision+',
    tagline: 'OTT Streaming Platform',
    year: 2022,
    period: '2022',
    role: 'Middle Frontend Developer at MNC Group',
    rank: 'B',
    summary:
      'Dolby Atmos audio integration, the video player and Midtrans payments, plus the movie rental experience.',
    problem:
      'Vision+ streams films and series to paying viewers, so the video player, the audio and the payment flow all have to work together.',
    solution: [
      'Implemented Dolby Atmos integration to improve the audio experience.',
      'Maintained and optimized analytics tracking to support data-driven product decisions.',
      'Developed and maintained the video player and the payment system integration, including a payment method feature using Midtrans.',
      'Contributed to the movie rental feature, which lets users rent and stream selected titles.',
    ],
    outcome: null,
    stack: ['react'],
    tags: ['Dolby Atmos', 'Midtrans', 'Analytics'],
    links: [{ kind: 'demo', label: 'Visit Vision+', href: 'https://www.visionplus.id/webclient/' }],
    media: [
      {
        src: '/assets/vision+.webp',
        alt: 'Vision+ product preview',
        width: 960,
        height: 522,
      },
    ],
  },
  {
    id: 'my-indihome',
    title: 'My IndiHome',
    tagline: 'Telkomsel IndiHome Customer Platform',
    year: 2020,
    period: '2020 to 2022',
    role: 'Middle Frontend Developer at Telkom Group',
    rank: 'B',
    summary:
      'Nearest-plaza locator, Wi-Fi speed check, and real-time customer service chat built on Socket.io.',
    problem:
      'IndiHome customers needed to help themselves: find the nearest plaza, check their Wi-Fi speed and reach customer service in real time.',
    solution: [
      'Developed customer-facing features in React.js, including a nearest plaza locator and a Wi-Fi speed check.',
      'Built promotional campaign pages to improve engagement and service accessibility.',
      'Engineered real-time chat with Socket.io so customers can talk to customer service instantly.',
    ],
    outcome: null,
    stack: ['react', 'socket-io'],
    tags: ['Real-time chat'],
    // TODO(owner): the old site linked a Telkomsel ad landing page with tracking
    // parameters. Parameters removed here; confirm this is the right destination.
    links: [
      {
        kind: 'demo',
        label: 'Visit the IndiHome page at Telkomsel',
        href: 'https://www.telkomsel.com/landingpage/regular/reg5',
      },
    ],
    media: [
      {
        src: '/assets/indihome.webp',
        alt: 'My IndiHome product preview',
        width: 960,
        height: 530,
      },
    ],
  },
  {
    id: 'dataexchange',
    title: 'DataExchange',
    tagline: 'Data Marketplace Platform',
    year: 2020,
    period: '2020 to 2021',
    role: 'Junior Frontend Developer at Telkom Group',
    rank: 'C',
    summary:
      'Refactored the landing page for performance and shipped 80% unit test coverage on the internal dashboard.',
    problem:
      'DataExchange is a data marketplace. Its landing page needed better performance and maintainability, and its internal dashboard needed to be more reliable.',
    solution: [
      'Refactored the landing page in React.js for better performance and maintainability.',
      'Managed and improved internal dashboard functionality to support data access and usability.',
      'Implemented unit testing across the dashboard.',
    ],
    outcome:
      'Unit tests reached 80% coverage, which significantly reduced bugs and made the code more reliable.',
    stack: ['react'],
    tags: ['Unit testing'],
    // TODO(owner): this is a staging URL from the old site. Confirm or replace.
    links: [{ kind: 'demo', label: 'Visit DataExchange', href: 'https://dx-stage.udata.id/' }],
    media: [
      {
        src: '/assets/dataexchange.webp',
        alt: 'DataExchange product preview',
        width: 960,
        height: 524,
      },
    ],
  },
  {
    id: 'palapa-one',
    title: 'Palapa One',
    tagline: 'Event Management App',
    year: 2019,
    period: '2019 to 2020',
    role: 'Junior Frontend Developer at Telkom Group',
    rank: 'C',
    summary:
      'Event dashboards for registration and rundown data, with real-time chat for audience engagement.',
    problem:
      'Event organisers needed one place to manage registration, documents and rundown data, and event pages that matched each client’s branding.',
    solution: [
      'Developed a React.js dashboard for managing events, including user registration, documents and rundown data.',
      'Created customizable web event pages tailored to each client’s branding.',
      'Implemented real-time chat to improve audience engagement during events.',
    ],
    outcome: null,
    stack: ['react'],
    tags: ['Real-time chat', 'Dashboard'],
    links: [],
    media: [
      {
        src: '/assets/palapaone.webp',
        alt: 'Palapa One product preview',
        width: 905,
        height: 960,
      },
    ],
  },
];

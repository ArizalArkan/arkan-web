import type { Education, Experience } from './schema';

// Straight from the CV, newest first. Wording tightened only.
export const experience: Experience[] = [
  {
    id: 'astra-financial',
    company: 'Astra Financial',
    product: 'Bank Saqu',
    productTagline: 'Smart Digital Banking Platform',
    period: '2025 to now',
    isCurrent: true,
    questId: 'bank-saqu',
    roles: [
      {
        title: 'Senior Frontend Engineer',
        period: '2025 to now',
        achievements: [
          'Maintain and enhance the internal operational payment dashboard in React.js, supporting day-to-day payment operations.',
          'Migrated legacy components to a shared design system, improving code consistency and reducing technical debt across the application.',
        ],
      },
      {
        title: 'Middle Mobile Engineer',
        period: '2025 to now',
        achievements: [
          'Develop and maintain the financial mobile app in React Native, handling core payment features: biller and bill payments, QRIS, transfers and virtual accounts (VA).',
          'Work closely with the design team for pixel-perfect implementation of the Figma specifications.',
        ],
      },
    ],
  },
  {
    id: 'altaraone-freelance',
    company: 'Freelance',
    product: 'AltaraOne',
    productTagline: 'Digital Audit and Business Process Management Platform',
    period: '2025',
    isCurrent: false,
    questId: 'altaraone',
    roles: [
      {
        title: 'Lead Frontend Engineer',
        period: '2025',
        achievements: [
          'Built the web application from scratch with Next.js, establishing a scalable, maintainable frontend architecture and an Atomic Design system for long-term product growth.',
          'Own the frontend architecture end to end, keeping code quality and maintainability as the codebase and team scale.',
          'Lead and manage task distribution across frontend team members, balancing workload and unblocking delivery on complex audit workflows.',
          'Worked closely with product managers, designers and backend engineers to turn business requirements into technical solutions.',
        ],
      },
    ],
  },
  {
    id: 'kawan-lama-group',
    company: 'Kawan Lama Group',
    product: 'Ruparupa.com',
    productTagline: 'No.1 Home, Living and Furniture E-commerce in Indonesia',
    period: '2022 to 2025',
    isCurrent: false,
    questId: 'ruparupa',
    roles: [
      {
        title: 'Senior Frontend Engineer',
        period: '2024 to 2025',
        achievements: [
          'Developed and maintained Product Detail Pages (PDP) and order management dashboards with Next.js.',
          'Built secure middleware integrations with Express.js and Nest.js to protect sensitive data and strengthen application security.',
          'Refactored legacy code to improve performance, scalability and long-term maintainability.',
        ],
      },
      {
        title: 'Middle Frontend Engineer',
        period: '2022 to 2024',
        achievements: [
          'Turned designs and wireframes into a fully functional, responsive e-commerce web application with Next.js.',
          'Developed key features, including self-care portals and campaign-specific functionality, to meet business and user needs.',
          'Optimized code quality and application performance for scalability and reliability.',
        ],
      },
    ],
  },
  {
    id: 'mnc-group',
    company: 'MNC Group',
    product: 'Vision+',
    productTagline: 'OTT Streaming Platform',
    period: '2022',
    isCurrent: false,
    questId: 'vision-plus',
    roles: [
      {
        title: 'Middle Frontend Developer',
        period: '2022',
        achievements: [
          'Implemented Dolby Atmos integration to improve the audio experience for users.',
          'Maintained and optimized analytics tracking to support data-driven product decisions.',
          'Handled development and maintenance of the video player and payment system integration, including a payment method feature using Midtrans.',
          'Contributed to the movie rental feature, which lets users rent and stream selected titles.',
        ],
      },
    ],
  },
  {
    id: 'telkom-my-indihome',
    company: 'Telkom Group',
    product: 'My IndiHome',
    productTagline: 'Telkomsel IndiHome Customer Platform',
    period: '2020 to 2022',
    isCurrent: false,
    questId: 'my-indihome',
    roles: [
      {
        title: 'Middle Frontend Developer',
        period: '2020 to 2022',
        achievements: [
          'Developed customer-facing features in React.js, including a nearest plaza locator and a Wi-Fi speed check.',
          'Built promotional campaign pages to improve user engagement and service accessibility.',
          'Engineered real-time chat with Socket.io, enabling instant communication with customer service.',
        ],
      },
    ],
  },
  {
    id: 'telkom-dataexchange',
    company: 'Telkom Group',
    product: 'DataExchange',
    productTagline: 'Data Marketplace Platform',
    period: '2020 to 2021',
    isCurrent: false,
    questId: 'dataexchange',
    roles: [
      {
        title: 'Junior Frontend Developer',
        period: '2020 to 2021',
        achievements: [
          'Refactored the landing page in React.js for better performance and maintainability.',
          'Managed and improved internal dashboard functionality to support data access and usability.',
          'Implemented unit testing with 80% coverage, significantly reducing bugs and increasing code reliability.',
        ],
      },
    ],
  },
  {
    id: 'telkom-palapa-one',
    company: 'Telkom Group',
    product: 'Palapa One',
    productTagline: 'Event Management App',
    // TODO(owner): the CV lists this block as 2019 to 2021 but the role as 2019 to 2020. Confirm.
    period: '2019 to 2020',
    isCurrent: false,
    questId: 'palapa-one',
    roles: [
      {
        title: 'Junior Frontend Developer',
        period: '2019 to 2020',
        achievements: [
          'Developed a React.js dashboard for managing events, including user registration, documents and rundown data.',
          'Created customizable web event pages tailored to each client’s branding needs.',
          'Implemented real-time chat to improve audience engagement and interaction during events.',
        ],
      },
    ],
  },
];

export const education: Education[] = [
  {
    school: 'Institut Teknologi Bandung',
    program: 'Professional Engineer Program',
    period: '2026',
  },
  {
    school: 'Universitas Indraprasta',
    program: 'Bachelor of Information Technology',
    period: '2025',
  },
];

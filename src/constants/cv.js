// Sourced directly from Arizal_Arkan_-_CV.pdf. Keep this file the single
// source of truth for the /cv page so the two never drift apart.
export const cvContent = {
  name: 'Arizal Arkan',
  role: 'Software Engineer',
  location: 'Jakarta, Indonesia',
  summary:
    'Software Engineer with 6+ years building products across banking, e-commerce, streaming platform, audit, and telco, with strong roots in frontend (React, Vue, Next.js, React Native) and growing full-stack capability (Node.js, Nest.js, Golang).',
  contact: {
    phone: '+62 857-1761-7899',
    phoneHref: 'tel:+6285717617899',
    email: 'arizalarkan@gmail.com',
    emailHref: 'mailto:arizalarkan@gmail.com',
    linkedin: 'linkedin.com/in/arizal-arkan-09',
    linkedinHref: 'https://www.linkedin.com/in/arizal-arkan-09/',
    github: 'github.com/ArizalArkan',
    githubHref: 'https://github.com/ArizalArkan',
  },
  skills: [
    {
      category: 'Frontend',
      accent: '#FFD93D',
      items: ['JavaScript', 'TypeScript', 'React.js', 'Vue.js', 'Next.js', 'Nuxt.js', 'TanStack', 'RedwoodJS'],
    },
    {
      category: 'Backend',
      accent: '#FF6B9D',
      items: ['Node.js', 'Express.js', 'Nest.js', 'Golang', 'Echo'],
    },
    {
      category: 'Database',
      accent: '#A8E10C',
      items: ['PostgreSQL', 'MongoDB'],
    },
    {
      category: 'Tools',
      accent: '#7DD3FC',
      items: ['Vite', 'Webpack', 'Babel.js'],
    },
  ],
  experience: [
    {
      company: 'Astra Financial',
      product: 'Bank Saqu — Smart Digital Banking Platform',
      period: '2025 — Now',
      roles: [
        {
          title: 'Senior Frontend Engineer',
          period: '2025 — Now',
          bullets: [
            'Maintain and enhance the internal operational payment dashboard using React.js, supporting day-to-day payment operations.',
            'Migrated legacy components to a shared design system, improving code consistency and reducing technical debt across the application.',
          ],
        },
        {
          title: 'Middle Mobile Engineer',
          period: '2025 — Now',
          bullets: [
            'Developing and maintaining the financial mobile app using React Native, handling core payment features: biller/bill payments, QRIS, transfers, and virtual accounts (VA).',
            'Collaborated closely with the design team to ensure pixel-perfect implementation matching Figma specifications.',
          ],
        },
      ],
    },
    {
      company: 'Kawan Lama Group',
      product: "Ruparupa.com — No.1 Home, Living & Furniture E-commerce in Indonesia",
      period: '2022 — 2025',
      roles: [
        {
          title: 'Middle Frontend Engineer',
          period: '2022 — 2024',
          bullets: [
            'Transformed designs and wireframes into a fully functional e-commerce web application using Next.js, delivering a seamless and responsive user experience.',
            'Developed key features, including self-care portals and campaign-specific functionalities, to meet diverse business and user needs.',
            'Optimized code quality and application performance to ensure scalability and reliability.',
          ],
        },
        {
          title: 'Senior Frontend Engineer',
          period: '2024 — 2025',
          bullets: [
            'Developed and maintained Product Detail Pages (PDP) and order management dashboards using Next.js.',
            'Built secure middleware integrations with Express.js and Nest.js to protect sensitive data and strengthen application security.',
            'Refactored legacy code to improve performance, scalability, and long-term maintainability.',
          ],
        },
      ],
    },
    {
      company: 'MNC Group',
      product: 'Vision+ — OTT Streaming Platform',
      period: '2022',
      roles: [
        {
          title: 'Middle Frontend Developer',
          period: '2022 — 2022',
          bullets: [
            'Implemented Dolby Atmos integration to enhance the audio experience for users.',
            'Maintained and optimized analytics tracking to support data-driven product decisions.',
            'Handled development and maintenance of the video player and payment system integration, including a payment method feature using Midtrans.',
            'Contributed to building the movie rental feature, enabling users to rent and stream selected titles.',
          ],
        },
      ],
    },
    {
      company: 'Telkom Group',
      product: 'Palapa One — Event Management App',
      period: '2019 — 2021',
      roles: [
        {
          title: 'Junior Frontend Developer',
          period: '2019 — 2020',
          bullets: [
            'Developed a React.js-based dashboard for managing events, including user registration, documents, and rundown data.',
            'Created customizable web event pages tailored to each client’s branding needs.',
            'Implemented real-time chat functionality to improve audience engagement and interaction during events.',
          ],
        },
      ],
    },
    {
      company: 'Telkom Group',
      product: 'DataExchange — Data Marketplace Platform',
      period: '2020 — 2021',
      roles: [
        {
          title: 'Junior Frontend Developer',
          period: '2020 — 2021',
          bullets: [
            'Refactored the landing page using React.js for better performance and maintainability.',
            'Managed and improved internal dashboard functionality to support data access and usability.',
            'Implemented unit testing with 80% coverage, significantly reducing bugs and increasing code reliability.',
          ],
        },
      ],
    },
    {
      company: 'Telkom Group',
      product: 'My IndiHome — Telkomsel IndiHome Customer Platform',
      period: '2020 — 2022',
      roles: [
        {
          title: 'Middle Frontend Developer',
          period: '2020 — 2022',
          bullets: [
            'Developed customer-facing features using React.js, including a nearest plaza locator and Wi-Fi speed check.',
            'Built promotional campaign pages to improve user engagement and service accessibility.',
            'Engineered real-time chat functionality using Socket.io, enabling instant communication with customer service.',
          ],
        },
      ],
    },
  ],
  projects: [
    {
      name: 'AltaraOne (Freelance)',
      role: 'Lead Frontend Engineer',
      period: '2025',
      product: 'Digital Audit & Business Process Management Platform',
      bullets: [
        'Built the web application from scratch using Next.js, establishing a scalable, maintainable frontend architecture and design system (Atomic Design) for long-term product growth.',
        'Own the frontend architecture end-to-end, ensuring code quality and maintainability as the codebase and team scale.',
        'Lead and manage task distribution across frontend team members, balancing workload and unblocking delivery on complex audit workflows.',
        'Collaborated closely with product managers, designers, and backend engineers to transform business requirements into robust technical solutions.',
      ],
    },
  ],
  education: [
    { school: 'Institut Teknologi Bandung', program: 'Professional Engineer Program', period: '2026' },
    { school: 'Universitas Indraprasta', program: 'Bachelor of Information Technology', period: '2025' },
  ],
  certifications: [
    'Unity Certified Associate: Game Developer',
    'Pijar Software Engineering Bootcamp',
    'React JS: Progressive Web Apps',
  ],
};

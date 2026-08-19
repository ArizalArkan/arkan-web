export const navLinks = [
    {
      id: 1,
      name: 'Home',
      href: '#home',
    },
    {
      id: 2,
      name: 'About',
      href: '#about',
    },
    {
      id: 3,
      name: 'Experience',
      href: '#experience',
    },
    {
      id: 4,
      name: 'Work',
      href: '#work',
    },
    {
      id: 5,
      name: 'Contact',
      href: '#contact',
    },
  ];

  export const heroContent = {
    greetings: ['안녕하세요', 'こんにちは', 'Hola', 'Hi', 'Bonjour', 'Hai'],
    name: "I'M ARKAN 👋",
    headline: ['CRAFTING', 'DIGITAL', 'EXPERIENCES.'],
    highlight: 'DIGITAL',
    sticker: '★ FULL-STACK',
    subhead:
      'Full-stack software engineer building fast, accessible products end-to-end — React and Vue on the front, Node.js and Go on the back.',
    ctaPrimary: { label: 'SEE MY WORK', href: '#work' },
    ctaSecondary: { label: 'ABOUT ME', href: '#about' },
    marquee: [
      'AVAILABLE FOR WORK',
      'REACT',
      'VUE.JS',
      'REACT NATIVE',
      'NODE.JS',
      'EXPRESS.JS',
      'NEST.JS',
      'GOLANG',
      'MONGODB',
      'POSTGRESQL',
      'TAILWIND',
      'TYPESCRIPT',
      'THREE.JS',
      'GSAP',
    ],
  };

  export const clientReviews = [
    {
      id: 1,
      name: 'Emily Johnson',
      position: 'Marketing Director at GreenLeaf',
      img: 'assets/review1.png',
      review:
        'Working with Adrian was a fantastic experience. He transformed our outdated website into a modern, user-friendly platform. His attention to detail and commitment to quality are unmatched. Highly recommend him for any web dev projects.',
    },
    {
      id: 2,
      name: 'Mark Rogers',
      position: 'Founder of TechGear Shop',
      img: 'assets/review2.png',
      review:
        'Adrian’s expertise in web development is truly impressive. He delivered a robust and scalable solution for our e-commerce site, and our online sales have significantly increased since the launch. He’s a true professional! Fantastic work.',
    },
    {
      id: 3,
      name: 'John Dohsas',
      position: 'Project Manager at UrbanTech ',
      img: 'assets/review3.png',
      review:
        'I can’t say enough good things about Adrian. He was able to take our complex project requirements and turn them into a seamless, functional website. His problem-solving abilities are outstanding.',
    },
    {
      id: 4,
      name: 'Ether Smith',
      position: 'CEO of BrightStar Enterprises',
      img: 'assets/review4.png',
      review:
        'Adrian was a pleasure to work with. He understood our requirements perfectly and delivered a website that exceeded our expectations. His skills in both frontend backend dev are top-notch.',
    },
  ];
  
  export const myProjects = [
    {
      title: 'Podcastr - AI Podcast Platform',
      desc: 'Podcastr is a revolutionary Software-as-a-Service platform that transforms the way podcasts are created. With advanced AI-powered features like text-to-multiple-voices functionality, it allows creators to generate diverse voiceovers from a single text input.',
      subdesc:
        'Built as a unique Software-as-a-Service app with Next.js 14, Tailwind CSS, TypeScript, Framer Motion and Convex, Podcastr is designed for optimal performance and scalability.',
      href: 'https://www.youtube.com/watch?v=zfAb95tJvZQ',
      texture: '/textures/project/project1.mp4',
      logo: '/assets/project-logo1.png',
      logoStyle: {
        backgroundColor: '#2A1816',
        border: '0.2px solid #36201D',
        boxShadow: '0px 0px 60px 0px #AA3C304D',
      },
      spotlight: '/assets/spotlight1.png',
      tags: [
        {
          id: 1,
          name: 'React.js',
          path: '/assets/react.svg',
        },
        {
          id: 2,
          name: 'TailwindCSS',
          path: 'assets/tailwindcss.png',
        },
        {
          id: 3,
          name: 'TypeScript',
          path: '/assets/typescript.png',
        },
        {
          id: 4,
          name: 'Framer Motion',
          path: '/assets/framer.png',
        },
      ],
    },
    {
      title: 'LiveDoc - Real-Time Google Docs Clone',
      desc: 'LiveDoc is a powerful collaborative app that elevates the capabilities of real-time document editing. As an enhanced version of Google Docs, It supports millions of collaborators simultaneously, ensuring that every change is captured instantly and accurately.',
      subdesc:
        'With LiveDoc, users can experience the future of collaboration, where multiple contributors work together in real time without any lag, by using Next.js and Liveblocks newest features.',
      href: 'https://www.youtube.com/watch?v=y5vE8y_f_OM',
      texture: '/textures/project/project2.mp4',
      logo: '/assets/project-logo2.png',
      logoStyle: {
        backgroundColor: '#13202F',
        border: '0.2px solid #17293E',
        boxShadow: '0px 0px 60px 0px #2F6DB54D',
      },
      spotlight: '/assets/spotlight2.png',
      tags: [
        {
          id: 1,
          name: 'React.js',
          path: '/assets/react.svg',
        },
        {
          id: 2,
          name: 'TailwindCSS',
          path: 'assets/tailwindcss.png',
        },
        {
          id: 3,
          name: 'TypeScript',
          path: '/assets/typescript.png',
        },
        {
          id: 4,
          name: 'Framer Motion',
          path: '/assets/framer.png',
        },
      ],
    },
    {
      title: 'CarePulse - Health Management System',
      desc: 'An innovative healthcare platform designed to streamline essential medical processes. It simplifies patient registration, appointment scheduling, and medical record management, providing a seamless experience for both healthcare providers and patients.',
      subdesc:
        'With a focus on efficiency, CarePulse integrantes complex forms and SMS notifications, by using Next.js, Appwrite, Twillio and Sentry that enhance operational workflows.',
      href: 'https://www.youtube.com/watch?v=lEflo_sc82g',
      texture: '/textures/project/project3.mp4',
      logo: '/assets/project-logo3.png',
      logoStyle: {
        backgroundColor: '#60f5a1',
        background:
          'linear-gradient(0deg, #60F5A150, #60F5A150), linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(208, 213, 221, 0.8) 100%)',
        border: '0.2px solid rgba(208, 213, 221, 1)',
        boxShadow: '0px 0px 60px 0px rgba(35, 131, 96, 0.3)',
      },
      spotlight: '/assets/spotlight3.png',
      tags: [
        {
          id: 1,
          name: 'React.js',
          path: '/assets/react.svg',
        },
        {
          id: 2,
          name: 'TailwindCSS',
          path: 'assets/tailwindcss.png',
        },
        {
          id: 3,
          name: 'TypeScript',
          path: '/assets/typescript.png',
        },
        {
          id: 4,
          name: 'Framer Motion',
          path: '/assets/framer.png',
        },
      ],
    },
    {
      title: 'Horizon - Online Banking Platform',
      desc: 'Horizon is a comprehensive online banking platform that offers users a centralized finance management dashboard. It allows users to connect multiple bank accounts, monitor real-time transactions, and seamlessly transfer money to other users.',
      subdesc:
        'Built with Next.js 14 Appwrite, Dwolla and Plaid, Horizon ensures a smooth and secure banking experience, tailored to meet the needs of modern consumers.',
      href: 'https://www.youtube.com/watch?v=PuOVqP_cjkE',
      texture: '/textures/project/project4.mp4',
      logo: '/assets/project-logo4.png',
      logoStyle: {
        backgroundColor: '#0E1F38',
        border: '0.2px solid #0E2D58',
        boxShadow: '0px 0px 60px 0px #2F67B64D',
      },
      spotlight: '/assets/spotlight4.png',
      tags: [
        {
          id: 1,
          name: 'React.js',
          path: '/assets/react.svg',
        },
        {
          id: 2,
          name: 'TailwindCSS',
          path: 'assets/tailwindcss.png',
        },
        {
          id: 3,
          name: 'TypeScript',
          path: '/assets/typescript.png',
        },
        {
          id: 4,
          name: 'Framer Motion',
          path: '/assets/framer.png',
        },
      ],
    },
    {
      title: 'Imaginify - AI Photo Manipulation App',
      desc: 'Imaginify is a groundbreaking Software-as-a-Service application that empowers users to create stunning photo manipulations using AI technology. With features like AI-driven image editing, a payments system, and a credits-based model.',
      subdesc:
        'Built with Next.js 14, Cloudinary AI, Clerk, and Stripe, Imaginify combines cutting-edge technology with a user-centric approach. It can be turned into a side income or even a full-fledged business.',
      href: 'https://www.youtube.com/watch?v=Ahwoks_dawU',
      texture: '/textures/project/project5.mp4',
      logo: '/assets/project-logo5.png',
      logoStyle: {
        backgroundColor: '#1C1A43',
        border: '0.2px solid #252262',
        boxShadow: '0px 0px 60px 0px #635BFF4D',
      },
      spotlight: '/assets/spotlight5.png',
      tags: [
        {
          id: 1,
          name: 'React.js',
          path: '/assets/react.svg',
        },
        {
          id: 2,
          name: 'TailwindCSS',
          path: 'assets/tailwindcss.png',
        },
        {
          id: 3,
          name: 'TypeScript',
          path: '/assets/typescript.png',
        },
        {
          id: 4,
          name: 'Framer Motion',
          path: '/assets/framer.png',
        },
      ],
    },
  ];
  
  export const workExperiences = [
    {
      id: 1,
      name: 'Ruparupa',
      pos: 'Frontend Developer',
      duration: '2022 - 2025',
      title: "Framer serves as my go-to tool for creating interactive prototypes. I use it to bring designs to  life, allowing stakeholders to experience the user flow and interactions before development.",
      icon: '/assets/ruparupa.png',
      animation: 'victory',
    },
    {
      id: 2,
      name: 'Vision+',
      pos: 'Web Frontend Developer',
      duration: '2022 - 2022',
      title: "Figma is my collaborative design platform of choice. I utilize it to work seamlessly with team members and clients, facilitating real-time feedback and design iterations. Its cloud-based.",
      icon: '/assets/vision.png',
      animation: 'clapping',
    },
    {
      id: 3,
      name: 'Telkom Indonesia',
      pos: 'Junior Web Developer',
      duration: '2019 - 2022',
      title: "Notion helps me keep my projects organized. I use it for project management, task tracking, and as a central hub for documentation, ensuring that everything from design notes to.",
      icon: '/assets/telkom.png',
      animation: 'salute',
    },
  ];
  // Real products/platforms from the CV's work history — not fabricated
  // demo case studies. No public per-product links exist (internal /
  // enterprise apps), so every card points to the GitHub profile instead
  // of a fake live-demo URL.
  export const workProjects = [
    {
      id: 1,
      title: 'Bank Saqu',
      subtitle: 'Smart Digital Banking Platform',
      period: '2025 — Present',
      desc: 'Payment operations dashboard and a React Native banking app covering biller payments, QRIS, transfers, and virtual accounts.',
      tags: ['REACT', 'REACT NATIVE', 'DESIGN SYSTEM'],
      accent: '#FFD93D',
      href: 'https://play.google.com/store/apps/details?id=bjj.bank.digital.indo.prod&hl=id',
      ctaLabel: 'GET THE APP',
      image: '/assets/banksaqu.webp',
    },
    {
      id: 2,
      title: 'AltaraOne',
      subtitle: 'Digital Audit & Business Process Platform',
      period: '2025 · Freelance, Lead Frontend Engineer',
      desc: 'Led frontend architecture from scratch, building a scalable Next.js codebase on an Atomic Design system.',
      tags: ['NEXT.JS', 'ATOMIC DESIGN', 'LEAD'],
      accent: '#FF6B9D',
      href: 'https://github.com/ArizalArkan',
      ctaLabel: 'GITHUB',
      image: '/assets/altaraone.webp',
    },
    {
      id: 3,
      title: 'Ruparupa.com',
      subtitle: "Indonesia's No.1 Home, Living & Furniture E-commerce",
      period: '2022 — 2025',
      desc: 'Product detail pages, order management dashboards, and secure Express/Nest middleware protecting sensitive data at scale.',
      tags: ['NEXT.JS', 'EXPRESS.JS', 'NEST.JS'],
      accent: '#A8E10C',
      href: 'https://www.ruparupa.com/',
      ctaLabel: 'VISIT SITE',
      image: '/assets/ruparupacom.webp',
    },
    {
      id: 4,
      title: 'Vision+',
      subtitle: 'OTT Streaming Platform',
      period: '2022',
      desc: 'Dolby Atmos audio integration, video player and Midtrans payments, plus the movie rental experience.',
      tags: ['REACT', 'MIDTRANS', 'ANALYTICS'],
      accent: '#7DD3FC',
      href: 'https://www.visionplus.id/webclient/',
      ctaLabel: 'VISIT SITE',
      image: '/assets/vision+.webp',
    },
    {
      id: 5,
      title: 'My IndiHome',
      subtitle: 'Telkomsel Customer Platform',
      period: '2020 — 2022',
      desc: 'Nearest-plaza locator, Wi-Fi speed check, and real-time customer service chat built on Socket.io.',
      tags: ['REACT', 'SOCKET.IO'],
      accent: '#FFD93D',
      href: 'https://www.telkomsel.com/landingpage/regular/reg5?utm_source=pmax&utm_medium=all_placement&utm_campaign=mdm_aon_TSEL-Indihomearea-BC-10729_convert_leads_area2_reg4reg5_pmax_na&utm_term=jpeg_mp4&utm_content=signal_bau_acq_internetonly500mbps&gad_source=1&gad_campaignid=21784947344&gbraid=0AAAAADPZ06Pm4Q5KJ0ENeHGnDNngdAktG&gclid=CjwKCAjwqJXUBhBNEiwA8BgG7vyHDh8Dg_Yfmstb9gyeGUWDUv_ELRB4a_1rinZfA7RDZCkK62Bo2BoCEDgQAvD_BwE',
      ctaLabel: 'VISIT SITE',
      image: '/assets/indihome.webp',
    },
    {
      id: 6,
      title: 'Palapa One',
      subtitle: 'Event Management App',
      period: '2019 — 2020',
      desc: 'Event dashboards for registration and rundown data, with real-time chat for audience engagement.',
      tags: ['REACT'],
      accent: '#FF6B9D',
      href: 'https://github.com/ArizalArkan',
      ctaLabel: 'GITHUB',
      image: '/assets/palapaone.webp',
    },
    {
      id: 7,
      title: 'DataExchange',
      subtitle: 'Data Marketplace Platform',
      period: '2020 — 2021',
      desc: 'Refactored the landing page for performance and shipped 80% unit test coverage across the internal dashboard.',
      tags: ['REACT', 'TESTING'],
      accent: '#A8E10C',
      href: 'https://dx-stage.udata.id/',
      ctaLabel: 'VISIT SITE',
      image: '/assets/dataexchange.webp',
    },
  ];

  export const contactContent = {
    eyebrow: 'AVAILABLE FOR OPPORTUNITIES',
    status: 'open to opportunities · software engineer',
    commands: [
      {
        id: 'email',
        command: 'contact --email',
        value: 'arizalarkan@gmail.com',
        href: 'mailto:arizalarkan@gmail.com',
        external: false,
      },
      {
        id: 'github',
        command: 'contact --github',
        value: 'github.com/ArizalArkan',
        href: 'https://github.com/ArizalArkan',
        external: true,
      },
      {
        id: 'linkedin',
        command: 'contact --linkedin',
        value: 'linkedin.com/in/arizal-arkan-09',
        href: 'https://www.linkedin.com/in/arizal-arkan-09/',
        external: true,
      },
      {
        id: 'resume',
        command: 'contact --resume',
        value: 'view resume',
        href: '#/cv',
        external: false,
        internalRoute: true,
      },
    ],
  };

  export const aboutContent = {
    yearsLabel: '6+',
    statHeadline: ['years shipping', 'production code'],
    statBody:
      'Full-stack software engineer blending sharp UI/UX with backend that holds up in production.',
    // Mapped from real work history: Bank Saqu (banking), Ruparupa.com
    // (e-commerce), Vision+ (streaming), Telkom Group's three products
    // (telco), AltaraOne (audit).
    industries: ['Banking', 'E-commerce', 'Streaming', 'Telco', 'Audit'],
    industriesBody:
      'Balancing user needs, business goals and engineering constraints, wherever the domain.',
    location: {
      city: 'Jakarta, ID',
      headline: "I'm flexible",
      body: 'Based in Jakarta, Indonesia — open to work from anywhere.',
      cta: { label: 'Available — get in touch', href: '#contact' },
    },
    passion: {
      eyebrow: 'Why I code',
      headline: 'Problem-solving is the whole point',
      body:
        "Programming isn't just my profession — it's my passion. I enjoy exploring new technologies and turning messy requirements into something people actually enjoy using.",
      tags: ['REACT', 'NODE.JS', 'GOLANG'],
    },
    resume: {
      headline: 'Want the full story?',
      body: 'Work history, stack, and everything else — in one place.',
      cta: { label: 'View resume', href: '#/cv' },
    },
  };

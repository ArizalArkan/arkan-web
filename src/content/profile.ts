import type { Profile } from './schema';

// Sourced from the owner's CV and the previous site copy. Wording was
// tightened (no em dashes, no emoji); no facts were added.
export const profile: Profile = {
  name: 'Arizal Arkan',
  shortName: 'Arkan',
  role: 'Software Engineer',
  // TODO(owner): confirm the class name shown on the status sheet.
  heroClass: 'Full-Stack Engineer',
  tagline:
    'Full-stack software engineer building fast, accessible products end to end, with React and Vue on the front and Node.js and Go on the back.',
  bio: [
    'Software engineer with 6+ years building products across banking, e-commerce, streaming, audit and telco. My roots are in frontend (React, Vue, Next.js, React Native), with growing full-stack range in Node.js, Nest.js and Golang.',
    'Programming is my profession and my passion. I enjoy exploring new technologies and turning messy requirements into something people actually enjoy using.',
    'Wherever the domain, the job is the same: balance user needs, business goals and engineering constraints.',
  ],
  location: 'Jakarta, Indonesia',
  availability: 'Open to opportunities. Based in Jakarta, open to work from anywhere.',
  portrait: {
    src: '/assets/arkanava.webp',
    alt: 'Pixel-art illustration of Arizal coding at his desk in a black hoodie',
    width: 1536,
    height: 1024,
  },
  stats: [
    { label: 'Years shipping production code', value: '6+' },
    { label: 'Products shipped', value: '7' },
    { label: 'Industries', value: '5' },
  ],
  industries: ['Banking', 'E-commerce', 'Streaming', 'Telco', 'Audit'],
  email: 'arizalarkan@gmail.com',
  phone: { label: '+62 857-1761-7899', href: 'tel:+6285717617899' },
  links: [
    { id: 'github', label: 'Open GitHub profile', href: 'https://github.com/ArizalArkan' },
    {
      id: 'linkedin',
      label: 'Open LinkedIn profile',
      href: 'https://www.linkedin.com/in/arizal-arkan-09/',
    },
  ],
  // TODO(owner): add public/cv.pdf, then set { href: '/cv.pdf', fileName: 'Arizal-Arkan-CV.pdf' }.
  cv: null,
  certifications: [
    'Unity Certified Associate: Game Developer',
    'Pijar Software Engineering Bootcamp',
    'React JS: Progressive Web Apps',
  ],
};

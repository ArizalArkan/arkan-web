const VARIANTS = {
  yellow: 'bg-nb-yellow',
  white: 'bg-white',
  pink: 'bg-nb-pink',
  lime: 'bg-nb-lime',
};

const NbBadge = ({ children, variant = 'yellow', className = '' }) => (
  <span className={`nb-badge ${VARIANTS[variant] ?? VARIANTS.yellow} ${className}`}>
    {children}
  </span>
);

export default NbBadge;

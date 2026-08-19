const VARIANTS = {
  yellow: 'bg-nb-yellow',
  white: 'bg-white',
  pink: 'bg-nb-pink',
  lime: 'bg-nb-lime',
};

const NbButton = ({
  label,
  href,
  external = false,
  variant = 'yellow',
  className = '',
  children,
  onClick,
}) => {
  const classes = `nb-btn ${VARIANTS[variant] ?? VARIANTS.yellow} ${className}`;
  const content = children ?? label;

  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={classes}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {content}
    </button>
  );
};

export default NbButton;

import { useEffect, useRef, useState } from 'react';
import { contactContent } from '../constants';
import { navigate } from '../hooks/useHashRoute';
import { useScrollReveal } from '../hooks/useScrollReveal';
import NbBadge from '../components/ui/NbBadge';

const Contact = () => {
  const sectionRef = useScrollReveal();
  const linesRef = useRef(null);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const node = linesRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setBooted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const handleCommand = (item) => (event) => {
    if (item.internalRoute) {
      event.preventDefault();
      navigate(item.href);
    }
  };

  return (
    <section id="contact" ref={sectionRef} className="c-space mx-auto w-full max-w-7xl py-20">
      <div data-reveal className="flex flex-col items-start gap-3">
        <NbBadge variant="lime">Let&apos;s talk</NbBadge>
        <h2 className="font-display uppercase leading-[0.95] tracking-tight text-ink text-[clamp(1.75rem,5vw,3rem)]">
          Open a session
        </h2>
      </div>

      <div data-reveal className="mt-12 flex justify-center">
        <div className="w-full max-w-xl nb-border overflow-hidden shadow-nb-xl-pink">
          <div className="nb-window-bar">
            <span className="nb-dot bg-nb-pink" aria-hidden="true" />
            <span className="nb-dot bg-nb-yellow" aria-hidden="true" />
            <span className="nb-dot bg-nb-lime" aria-hidden="true" />
            <span className="ml-2 truncate">contact.sh</span>
          </div>

          <div ref={linesRef} className="bg-ink px-6 py-6 font-mono text-[13px] leading-[1.9] text-nb-lime sm:px-7">
            <div className={`nb-boot-line ${booted ? 'is-visible' : ''}`}>
              <span className="text-nb-sky">$</span> whoami --status
            </div>
            <div className={`nb-boot-line mb-3 text-paper/85 ${booted ? 'is-visible' : ''}`} style={{ transitionDelay: booted ? '80ms' : '0ms' }}>
              &gt; {contactContent.status}
            </div>

            {contactContent.commands.map((item, i) => (
              <a
                key={item.id}
                href={item.href}
                onClick={handleCommand(item)}
                {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className={`nb-boot-line group block px-1 py-0.5 -mx-1 hover:bg-nb-lime/10 ${booted ? 'is-visible' : ''}`}
                style={{ transitionDelay: booted ? `${140 + i * 90}ms` : '0ms' }}>
                <span className="text-nb-sky">$</span> {item.command}
                <span className="ml-2 text-paper/50 group-hover:text-paper/80">— {item.value}</span>
              </a>
            ))}

            <div
              className={`nb-boot-line mt-2 ${booted ? 'is-visible' : ''}`}
              style={{ transitionDelay: booted ? `${140 + contactContent.commands.length * 90}ms` : '0ms' }}>
              <span className="text-nb-sky">$</span> <span className="nb-caret">&#9608;</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;

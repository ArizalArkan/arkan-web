import { useEffect, useState } from 'react';

const getPath = () => window.location.hash.replace(/^#/, '') || '/';

// Hash-based routing: zero server config, works on any static host —
// the hash never reaches the server, so refreshing on /#/cv can't 404.
export function useHashRoute() {
  const [path, setPath] = useState(getPath);

  useEffect(() => {
    const onHashChange = () => setPath(getPath());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return path;
}

export function navigate(path) {
  window.location.hash = path;
}

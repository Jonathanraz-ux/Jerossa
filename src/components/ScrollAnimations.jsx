import { useEffect } from 'react';

export default function ScrollAnimations() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const observeElements = () => {
      document.querySelectorAll('.scroll-animate:not(.visible)').forEach((el) => {
        observer.observe(el);
      });
    };

    observeElements();
    const interval = setInterval(observeElements, 300);

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  return null;
}

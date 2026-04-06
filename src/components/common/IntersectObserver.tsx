import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const IntersectObserver = () => {
  const location = useLocation();

  useEffect(() => {
    let observer: IntersectionObserver | null = null;

    const initObserver = () => {
      const elements = document.querySelectorAll('.observe');

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('in-view');
            }
          });
        },
        {
          threshold: 0.1,
        }
      );

      elements.forEach((el) => observer?.observe(el));
    };

    // Delay to ensure DOM is ready after route change
    const timer = setTimeout(() => {
      initObserver();
    }, 100);

    return () => {
      clearTimeout(timer);
      observer?.disconnect();
    };
  }, [location]);

  return null;
};

export default IntersectObserver;

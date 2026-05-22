import { useEffect } from 'react';

const useTitle = (title) => {
  useEffect(() => {
    document.title = `${title} — TaskFlow`;
  }, [title]);
};

export default useTitle;
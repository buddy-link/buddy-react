import { useEffect, useState } from 'react';

export const useReferrer = () => {
  const [referrer, setReferrer] = useState('');

  // Function to parse query parameters from the URL
  const getQueryParam = (param) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  };

  useEffect(() => {
    // Replace router.query with direct window location access
    const urlReferrer= getQueryParam('r') || getQueryParam('ref');

    // Get existing referrer from localStorage or Cookies
    const localReferrer = localStorage.getItem('referrer');

    let cookies = decodeURIComponent(document.cookie).split(';');
    let cookieReferrer = '';
    for (let i = 0; i < cookies.length; i++) {
      let c = cookies[i].trim();
      if (c.indexOf('referrer=') === 0) {
        cookieReferrer = c.substring('referrer='.length, c.length);
        if (cookieReferrer === 'undefined') cookieReferrer = '';
      }
    }

    let storedReferrer = localReferrer || cookieReferrer || urlReferrer;

    if (urlReferrer) {
      localStorage.setItem('referrer', storedReferrer || '');
      document.cookie = `referrer=${urlReferrer}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
    }

    setReferrer(storedReferrer);
  }, []);

  return { referrer };
  // @ts-ignore
};
import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './index.css'
import App from './App.jsx'
import appStore from './utils/appStore'
import favicon16 from './favicon_io/favicon-16x16.png'
import favicon32 from './favicon_io/favicon-32x32.png'
import faviconIco from './favicon_io/favicon.ico'

function HeadSetup() {
  useEffect(() => {
    // Ensure title
    if (document.title !== 'Lost&Found') document.title = 'Lost&Found';

    const head = document.head;

    // Helper to upsert link tags
    const upsertLink = (rel, sizes, href, type) => {
      let link = head.querySelector(`link[rel="${rel}"]${sizes ? `[sizes="${sizes}"]` : ''}${type ? `[type="${type}"]` : ''}`);
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        if (sizes) link.sizes = sizes;
        if (type) link.type = type;
        head.appendChild(link);
      }
      link.href = href;
    };

    // Favicons
    upsertLink('icon', '16x16', favicon16, 'image/png');
    upsertLink('icon', '32x32', favicon32, 'image/png');
    upsertLink('icon', undefined, faviconIco, 'image/x-icon');
  }, []);
  return null;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={appStore}>
      <HeadSetup />
      <App />
    </Provider>
  </StrictMode>,
)

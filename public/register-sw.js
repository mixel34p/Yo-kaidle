if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.workbox !== undefined) {
  const wb = window.workbox;
  // add event listeners to handle any of PWA lifecycle event
  // https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-window.Workbox#events
  wb.addEventListener('installed', event => {
    console.log(`Event ${event.type} is triggered.`);
    console.log(event);
  });

  wb.addEventListener('controlling', event => {
    console.log(`Event ${event.type} is triggered.`);
    console.log(event);
  });

  wb.addEventListener('activated', event => {
    console.log(`Event ${event.type} is triggered.`);
    console.log(event);
  });

  // A common UX pattern for progressive web apps is to show a banner when a service worker has updated and waiting to install.
  // NOTE: MUST set skipWaiting to false in next.config.js pwa object
  // https://developers.google.com/web/tools/workbox/guides/advanced-recipes#offer_a_page_reload_for_users
  const promptNewVersionAvailable = event => {
    // `event.wasWaitingBeforeRegister` will be false if this is the first time the updated service worker is waiting
    if (event.wasWaitingBeforeRegister) {
      return;
    }

    // Assuming the user accepted the update, set up a listener that will reload the page as soon as the previously waiting service worker has taken control.
    wb.addEventListener('controlling', event => {
      window.location.reload();
    });

    wb.messageSkipWaiting();
  };

  // Add event listener for `appinstalled` event
  window.addEventListener('appinstalled', (event) => {
    console.log('👍', 'appinstalled', event);
  });
}

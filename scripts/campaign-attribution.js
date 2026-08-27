(() => {
  const campaignKeys = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
    'variant'
  ];
  const pageParams = new URLSearchParams(window.location.search);
  const campaignParams = new URLSearchParams();

  campaignKeys.forEach((key) => {
    if (pageParams.has(key)) {
      campaignParams.set(key, pageParams.get(key));
    }
  });

  const campaignDetail = () => Object.fromEntries(campaignParams);

  function applyCampaignAttribution() {
    document.querySelectorAll('a[data-preserve-campaign="true"]').forEach((link) => {
      const destination = new URL(link.href, window.location.href);

      campaignParams.forEach((value, key) => {
        destination.searchParams.set(key, value);
      });
      link.href = destination.toString();

      if (link.dataset.campaignAttributionBound === 'true') {
        return;
      }

      link.dataset.campaignAttributionBound = 'true';
      link.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('usable:signup-start', {
          detail: {
            destination: link.href,
            campaign: campaignDetail()
          }
        }));
      });
    });
  }

  applyCampaignAttribution();
  document.addEventListener('DOMContentLoaded', applyCampaignAttribution);
  document.addEventListener('all-components-loaded', applyCampaignAttribution);
})();

import { Identify, identify } from '@amplitude/analytics-browser';
import { type EnrichmentPlugin, type Event } from '@amplitude/analytics-types';

// Add values to all amplitude events
export class SiteVariantPlugin implements EnrichmentPlugin {
  name = 'siteVariant';

  async setup(): Promise<undefined> {
    const siteVarientIdentify = new Identify();
    siteVarientIdentify.set(this.name, 'next');
    await identify(siteVarientIdentify).promise;
    return undefined;
  }

  async execute(event: Event): Promise<Event> {
    return event;
  }
}

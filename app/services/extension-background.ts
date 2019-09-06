// Vendor
import Service from '@ember/service';
import {Promise} from 'rsvp';

declare const chrome: any;

export default class ExtensionBackground extends Service {
  async fetchPoeNinjaResource(resource: string): Promise<object> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {query: 'poe-ninja', resource},
        (payload: object | null) => {
          return payload ? resolve(payload) : reject(null);
        }
      );
    });
  }
}

declare module '@ember/service' {
  interface Registry {
    'extension-background': ExtensionBackground;
  }
}

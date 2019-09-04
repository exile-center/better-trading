// Vendor
import Service from '@ember/service';
import fetch from 'fetch';
import {Promise} from 'rsvp';

// Constants
const MIN_ERROR_STATUS = 400;

export default class Request extends Service {
  fetch(url: string): Promise<object> {
    const fetchParams = {
      method: 'GET'
    };

    return new Promise((resolve, reject) => {
      fetch(url, fetchParams).then(response => {
        if (response.status >= MIN_ERROR_STATUS) return reject(null);

        response.json().then(resolve);
      });
    });
  }
}

declare module '@ember/service' {
  interface Registry {
    request: Request;
  }
}

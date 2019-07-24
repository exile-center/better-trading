// Vendor
import Service from '@ember/service';

interface Session {
  token: string;
}

export default class SessionFetcher extends Service {
  async fetch(): Promise<Session> {
    return Promise.reject(Error('[session/fetcher] fetch not implemented.'));
  }
}

declare module '@ember/service' {
  interface Registry {
    'session/fetcher': SessionFetcher;
  }
}

import FastBoot from 'ember-cli-fastboot/services/fastboot';

declare class ShoeBox {
  retrieve(key: string): any;
  put(key: string, content: string): void;
}

declare class Request {
  cookies: object;
  headers: Headers;
  host: string;
  method: string;
  path: string;
  protocol: string;
  queryParams: object;
}

declare class Response {
  headers: Headers;
  statusCode: number;
}

declare module 'ember-cli-fastboot/services/fastboot' {
  export default class FastBoot {
    isFastBoot: boolean;
    shoebox: ShoeBox;
    request: Request
    response: Response
  }
}

declare module '@ember/service' {
  interface Registry {
    'fastboot': FastBoot;
  }
}

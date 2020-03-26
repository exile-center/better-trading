// Config
import config from 'better-trading/config/environment';

interface ExtensionApi {
  runtime: {
    getURL(path: string): string;
    sendMessage(query: object, callback: (payload: object | null) => void): void;
  };
}

export const extensionApi = (): ExtensionApi => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  // eslint-disable-next-line no-undef
  return config.APP.browser === 'chrome' ? chrome : browser;
};

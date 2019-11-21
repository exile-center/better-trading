interface Window {
  browser: {
    runtime: {
      getURL(path: string): string;
    };
  };

  chrome: {
    runtime: {
      getURL(path: string): string;
    };
  };
}

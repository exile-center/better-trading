export const copyToClipboard = (text: string) => {
  const dummyTextarea = window.document.createElement('textarea');
  dummyTextarea.value = text;
  dummyTextarea.style.opacity = '0';

  window.document.body.append(dummyTextarea);

  try {
    dummyTextarea.select();
    return document.execCommand('copy');
  } finally {
    dummyTextarea.remove();
  }
};

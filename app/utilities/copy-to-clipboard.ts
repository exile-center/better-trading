export const copyToClipboard = (text: string) => {
  const dummyTextarea = window.document.createElement('textarea');
  dummyTextarea.value = text;
  dummyTextarea.style.opacity = '0';

  window.document.body.append(dummyTextarea);

  dummyTextarea.select();
  document.execCommand('copy');

  dummyTextarea.remove();
};

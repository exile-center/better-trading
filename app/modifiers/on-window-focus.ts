// Vendor
import {modifier} from 'ember-modifier';

type Handler = () => void;

export default modifier((_element, [handler]: [Handler]) => {
  window.addEventListener('focus', handler);

  return () => {
    window.removeEventListener('focus', handler);
  };
});

// Vendor
import Service, {inject as service} from '@ember/service';

// Types
import FastBoot from 'ember-cli-fastboot/services/fastboot';

enum ServiceWorkerActions {
  SKIP_WAITING = 'skipWaiting',
  CHECK_FOR_UPDATES = 'checkForUpdates'
}

export default class ServiceWorkerService extends Service {
  @service('fastboot')
  fastboot: FastBoot;

  registration?: ServiceWorkerRegistration;
  updateReady: boolean = false;
  updateCallbacks: Array<() => void> = [];

  register(): ServiceWorkerService {
    if (this.fastboot.isFastBoot) return this;
    if (!navigator.serviceWorker) return this;

    this.listenToControllerChange();
    this.listenToUpdates();

    return this;
  }

  checkForUpdates() {
    if (this.updateReady) return;
    if (!this.registration) return;
    if (!this.registration.active) return;

    this.registration.active.postMessage({
      action: ServiceWorkerActions.CHECK_FOR_UPDATES
    });
  }

  onUpdateReady(callback: () => void) {
    this.set('updateCallbacks', [...this.updateCallbacks, callback]);
  }

  update() {
    if (!this.registration) return;
    if (!this.registration.waiting) return;

    this.registration.waiting.postMessage({
      action: ServiceWorkerActions.SKIP_WAITING
    });
  }

  private async listenToUpdates() {
    const registration = await navigator.serviceWorker.getRegistration();

    if (!registration) return;

    this.set('registration', registration);

    // The window client isn’t currently controlled so it’s a new
    // ServiceWorker that will activate immediately
    if (!navigator.serviceWorker.controller) return;

    if (registration.waiting) {
      this.notifyUpdateReady();

      return;
    }

    if (registration.installing) {
      this.trackInstallingWorker(registration.installing);

      return;
    }

    this.listenToUpdateFound(registration);
  }

  private listenToControllerChange() {
    // When the user asks to refresh the UI, we’ll need to reload the window
    // but we have to make sure to refresh only once.
    // This works around a bug in “Update on reload”.
    let preventDevToolsReloadLoop: boolean;

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (preventDevToolsReloadLoop) return;
      preventDevToolsReloadLoop = true;

      window.location.reload();
    });
  }

  private listenToUpdateFound(registration: ServiceWorkerRegistration) {
    registration.addEventListener('updatefound', () => {
      if (!registration.installing) return;

      this.trackInstallingWorker(registration.installing);
    });
  }

  private notifyUpdateReady() {
    this.updateCallbacks.forEach(callback => callback.call(this));
  }

  private trackInstallingWorker(serviceWorker: ServiceWorker) {
    serviceWorker.addEventListener('statechange', () => {
      if (serviceWorker.state === 'installed') {
        this.notifyUpdateReady();
      }
    });
  }
}

declare module '@ember/service' {
  interface Registry {
    'service-worker': ServiceWorkerService;
  }
}

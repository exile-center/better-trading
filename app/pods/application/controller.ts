// Vendor
import Controller from '@ember/controller';
import {readOnly} from '@ember/object/computed';
import {inject as service} from '@ember/service';

// Types
import RouterService from '@ember/routing/router-service';

export default class ApplicationController extends Controller {
  @service('router')
  router: RouterService;

  @readOnly('router.currentRouteName')
  currentRouteName: string;
}

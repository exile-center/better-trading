// Vendor
import Component from '@glimmer/component';
import {inject as service} from '@ember/service';

// Config
import config from 'better-trading/config/environment';
import DexieService from 'better-trading/services/dexie';

export default class PageAbout extends Component {
  @service('dexie')
  dexie: DexieService;

  appVersion = config.APP.version;
  githubUrl = config.APP.githubUrl;
  discordUrl = config.APP.discordUrl;
  chaosRecipeOverlayUrl = config.APP.chaosRecipeOverlayUrl;

  get isPersisted() {
    return this.dexie.isPersisted;
  }
}

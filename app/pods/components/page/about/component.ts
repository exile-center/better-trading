// Vendor
import Component from '@glimmer/component';

// Config
import config from 'better-trading/config/environment';

export default class PageAbout extends Component {
  appVersion = config.APP.version;
  githubUrl = config.APP.githubUrl;
  discordUrl = config.APP.discordUrl;
  chaosRecipeOverlayUrl = config.APP.chaosRecipeOverlayUrl;
}

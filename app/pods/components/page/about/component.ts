// Vendor
import Component from '@glimmer/component';

// Config
import config from 'better-trading/config/environment';

export default class PageAbout extends Component {
  githubUrl = config.APP.githubUrl;
  discordUrl = config.APP.discordUrl;
  chaosRecipeOverlayUrl = config.APP.chaosRecipeOverlayUrl;
}

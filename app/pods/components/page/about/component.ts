// Vendor
import Component from '@glimmer/component';
import {inject as service} from '@ember/service';
import {action} from '@ember/object';

// Types
import ItemResults from 'better-trading/services/item-results';

// Config
import config from 'better-trading/config/environment';

interface Enhancer {
  slug: string;
  isEnabled: boolean;
  translationKey: string;
}

export default class PageAbout extends Component {
  @service('item-results')
  itemResults: ItemResults;

  appVersion = config.APP.version;
  githubUrl = config.APP.githubUrl;
  discordUrl = config.APP.discordUrl;
  chaosRecipeOverlayUrl = config.APP.chaosRecipeOverlayUrl;
  currentChangelog = config.APP.changelog;

  get enhancers(): Enhancer[] {
    return this.itemResults.getEnhancerSlugs().map((slug) => ({
      slug,
      isEnabled: !this.itemResults.disabledEnhancerSlugs.includes(slug || ''),
      translationKey: `page.about.enhancers.${slug}`,
    }));
  }

  @action
  toggleDisabledEnhancerSlug(slug: string, isEnabled: boolean) {
    let updatedDisabledEnhancerSlugs = [...this.itemResults.disabledEnhancerSlugs];

    if (isEnabled) {
      updatedDisabledEnhancerSlugs = updatedDisabledEnhancerSlugs.filter((disabledSlug) => disabledSlug !== slug);
    } else {
      updatedDisabledEnhancerSlugs.push(slug);
    }

    this.itemResults.setDisabledEnhancerSlugs(updatedDisabledEnhancerSlugs);
  }
}

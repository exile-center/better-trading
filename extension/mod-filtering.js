// Runs in the page MAIN world to access PoE trade's internal Vue app (window.app).
(function startBetterTradingModFiltering() {
  if (window.__BT_MOD_FILTERING_STARTED__) return;

  document.documentElement.dataset.btModFiltering = 'loading';

  var bootAttempts = 0;
  var MAX_BOOT_ATTEMPTS = 120;

  var ROW_SELECTOR = '.resultset .row[data-id]:not(.exchange)';
  var MOD_CONTAINER_SELECTOR =
    '.item-mod, [class*="item-mod--"], .explicitMod, .implicitMod, .pseudoMod, .fracturedMod, .desecratedMod, .runeMod, .enchantMod';
  var MOD_HOVER_SELECTOR =
    '.item-mod--explicit, .item-mod--implicit, .item-mod--pseudo, .item-mod--fractured, .item-mod--desecrated, .item-mod--rune, .item-mod--enchant, .item-mod--crafted, .item-mod--mutated, ' +
    '.explicitMod, .implicitMod, .pseudoMod, .fracturedMod, .desecratedMod, .runeMod, .enchantMod';

  function boot() {
    if (!window.app || !document.querySelector('#trade')) {
      bootAttempts += 1;
      if (bootAttempts < MAX_BOOT_ATTEMPTS) {
        window.setTimeout(boot, 500);
      }
      return;
    }

    if (window.__BT_MOD_FILTERING_STARTED__) return;
    window.__BT_MOD_FILTERING_STARTED__ = true;
    document.documentElement.dataset.btModFiltering = 'ready';
    initializeModFiltering();
  }

  function initializeModFiltering() {
    var h = function(html) {
      var template = document.createElement('template');
      template.innerHTML = html.trim();
      return template.content.firstElementChild;
    };

    var styleEl = h(
      '<style>' +
        '.bt-mod-filter-btns { display: inline-flex; align-items: center; gap: 4px; margin-right: 6px; vertical-align: middle; z-index: 2; position: relative; }' +
        '.bt-mod-filter-btn { width: 20px; height: 20px; padding: 0; border: 1px solid rgba(255, 255, 255, 0.45); border-radius: 50%; color: #fff; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; font-size: 13px; line-height: 1; font-weight: 700; box-sizing: border-box; }' +
        '.bt-mod-filter-btn.add { background: rgba(2, 93, 34, 0.85); }' +
        '.bt-mod-filter-btn.rm { background: rgba(93, 2, 2, 0.85); }' +
        '.bt-mod-filter-btn:hover { filter: brightness(1.25); }' +
        '.bt-mod-filterable:hover { background: rgba(255, 255, 255, 0.2); }' +
        '.bt-mod-filtered { position: relative; }' +
        '.bt-mod-filtered-overlay { z-index: -1; position: absolute; inset: 0; background: rgba(0, 136, 0, 0.25); }' +
      '</style>'
    );
    document.head.appendChild(styleEl);

    var filteredOverlay = function() {
      return h('<div class="bt-mod-filtered-overlay"></div>');
    };

    var buttonsTemplate = function() {
      return h(
        '<span class="bt-mod-filter-btns">' +
          '<span class="bt-mod-filter-btn add" data-action="bt-add-filter" title="Add this mod to your search filters">+</span>' +
          '<span class="bt-mod-filter-btn rm" data-action="bt-rmv-filter" title="Exclude this mod from your search results">-</span>' +
        '</span>'
      );
    };

    var attachButtons = function(modElement) {
      if (!modElement || modElement.querySelector('.bt-mod-filter-btns')) return;

      var buttons = buttonsTemplate();
      var statText =
        modElement.querySelector('[data-field^="stat."]') ||
        modElement.querySelector('.lc.s') ||
        modElement.querySelector('.s');

      if (statText && statText.parentElement) {
        statText.parentElement.insertBefore(buttons, statText);
        return;
      }

      modElement.insertBefore(buttons, modElement.firstChild);
    };

    var rowWatchers = new WeakMap();

    var createFilter = function(id) {
      return id && {id: id, value: {}, disabled: false};
    };

    var getComponentTag = function(vm) {
      if (!vm) return '';

      if (vm.$vnode && vm.$vnode.tag) return String(vm.$vnode.tag);
      if (vm.$ && vm.$.type) {
        var type = vm.$.type;
        return String(type.name || type.__name || type.tag || '');
      }
      if (vm.$options) {
        return String(vm.$options.name || vm.$options.__name || vm.$options._componentTag || '');
      }

      return '';
    };

    var tagMatches = function(vm, tag) {
      return getComponentTag(vm).indexOf(tag) !== -1;
    };

    var walkVue3SubTree = function(vnode, visit, seen) {
      if (!vnode || typeof vnode !== 'object') return;

      if (vnode.component && vnode.component.proxy) {
        walkAllVue(vnode.component.proxy, visit, seen);
      }

      var children = vnode.children;
      if (!children) return;

      if (Array.isArray(children)) {
        children.forEach(function(child) {
          walkVue3SubTree(child, visit, seen);
        });
        return;
      }

      if (typeof children === 'object') {
        Object.keys(children).forEach(function(key) {
          walkVue3SubTree(children[key], visit, seen);
        });
      }
    };

    var walkAllVue = function(vm, visit, seen) {
      if (!vm) return;

      seen = seen || new WeakSet();
      if (seen.has(vm)) return;
      seen.add(vm);

      visit(vm);

      if (vm.$children && vm.$children.length) {
        vm.$children.forEach(function(child) {
          walkAllVue(child, visit, seen);
        });
      }

      if (vm.$) {
        walkVue3SubTree(vm.$.subTree, visit, seen);

        if (vm.$.refs) {
          Object.keys(vm.$.refs).forEach(function(key) {
            var ref = vm.$.refs[key];
            if (ref && ref.$) walkAllVue(ref, visit, seen);
          });
        }
      }
    };

    var findChildVueItem = function(parent, tag) {
      if (!parent) return null;

      if (parent.$children && parent.$children.length) {
        var directChild = parent.$children.find(function(child) {
          return tagMatches(child, tag);
        });
        if (directChild) return directChild;
      }

      var descendant = null;
      walkAllVue(parent, function(vm) {
        if (descendant || vm === parent) return;
        if (tagMatches(vm, tag)) descendant = vm;
      });

      return descendant;
    };

    var findVueItem = function(tags) {
      return tags.reduce(function(acc, tag) {
        return findChildVueItem(acc, tag);
      }, window.app);
    };

    var itemResultPanelVueItem = function() {
      var panel = findVueItem(['item-results-panel']);
      if (panel && typeof panel.search === 'function') return panel;

      var fallback = null;
      walkAllVue(window.app, function(vm) {
        if (fallback) return;
        if (typeof vm.search === 'function' && tagMatches(vm, 'item-results-panel')) {
          fallback = vm;
        }
      });

      return fallback;
    };

    var findVueResultItem = function(itemId) {
      var found = null;

      walkAllVue(window.app, function(vm) {
        if (found) return;
        if (vm.itemId === itemId) found = vm;
      });

      if (found) return found;

      var resultset = findVueItem(['item-results-panel', 'resultset']);
      return resultset && resultset.$children && resultset.$children.find(function(child) {
        return child.itemId === itemId;
      });
    };

    var itemSearchGroupsVueItems = function(type) {
      var groups = [];

      walkAllVue(window.app, function(vm) {
        if (typeof vm.selectFilter !== 'function') return;
        if (!vm.group || !vm.group.type) return;
        if (type && vm.group.type !== type) return;
        groups.push(vm);
      });

      if (groups.length) return groups;

      try {
        var panel = findVueItem(['item-search-panel', 'item-filter-panel']);
        if (!panel || !panel.$children) return [];

        return panel.$children.filter(function(child) {
          return tagMatches(child, 'stat-filter-group') && (!type || (child.group && child.group.type === type));
        });
      } catch (_error) {
        return [];
      }
    };

    var findTargetStatGroup = function(filterType) {
      var groups = itemSearchGroupsVueItems(filterType);

      return (
        groups.find(function(group) {
          return group.index !== 0;
        }) ||
        groups[groups.length - 1] ||
        groups[0] ||
        null
      );
    };

    var getVueStore = function(vueElement) {
      if (window.app && window.app.$store) return window.app.$store;
      if (vueElement && vueElement.$store) return vueElement.$store;
      return null;
    };

    var triggerSearch = function() {
      var panel = itemResultPanelVueItem();
      if (panel && typeof panel.search === 'function') {
        panel.search();
        return;
      }

      var searchButton = document.querySelector('.btn.search-btn');
      if (searchButton) searchButton.click();
    };

    var getStatHash = function(field) {
      if (!field) return '';
      return field.indexOf('stat.') === 0 ? field.slice(5) : field;
    };

    var findModContainer = function(statElement) {
      return (
        statElement.closest(MOD_CONTAINER_SELECTOR) ||
        statElement.closest('div[data-mod]') ||
        statElement.parentElement
      );
    };

    var rowHasModMarkup = function(row) {
      return Boolean(
        row.querySelector('[data-field^="stat."]') ||
          row.querySelector(MOD_HOVER_SELECTOR) ||
          row.querySelector('.item-popup__content') ||
          row.querySelector('.itemBoxContent .content') ||
          row.querySelector('div.content')
      );
    };

    var updateDiagnostics = function() {
      var row = document.querySelector(ROW_SELECTOR);

      document.documentElement.dataset.btModFilteringMarked = String(
        document.querySelectorAll('.bt-mod-filterable').length
      );

      document.documentElement.dataset.btModFilteringDiag = JSON.stringify({
        rows: document.querySelectorAll(ROW_SELECTOR).length,
        filterable: document.querySelectorAll('.bt-mod-filterable').length,
        processedRows: document.querySelectorAll('.bt-mod-filter-processed').length,
        hasMiddle: row && row.querySelector('.middle') ? 1 : 0,
        hasItemPopup: row && row.querySelector('.item-popup__content, .itemPopupContainer') ? 1 : 0,
        hasLegacyContent: row && row.querySelector('.itemBoxContent .content, div.content') ? 1 : 0,
        statFieldsInRow: row ? row.querySelectorAll('[data-field^="stat."]').length : 0,
        poe2Mods: row ? row.querySelectorAll('.item-mod--explicit, .item-mod--implicit').length : 0,
        legacyMods: row ? row.querySelectorAll('.explicitMod, .implicitMod').length : 0,
        compact: document.querySelector('.results.compact') ? 1 : 0,
      });
    };

    var markMod = function(mod, rowId, modHash, statGroups) {
      if (!mod || !modHash || mod.dataset.hash === modHash) return false;

      mod.dataset.hash = modHash;
      mod.dataset.rowid = rowId;

      var isInFilters = statGroups.some(function(statGroup) {
        return (
          statGroup.filters &&
          statGroup.filters.some(function(filter) {
            return filter.id === modHash;
          })
        );
      });

      mod.classList.remove('bt-mod-filterable', 'bt-mod-filtered');

      if (isInFilters) {
        mod.classList.add('bt-mod-filtered');
        if (!mod.querySelector('.bt-mod-filtered-overlay')) {
          mod.appendChild(filteredOverlay());
        }
      } else {
        mod.classList.add('bt-mod-filterable');
      }

      return true;
    };

    var processRow = function(row) {
      if (!row) return false;

      try {
        if (!rowHasModMarkup(row)) return false;

        var rowId = row.getAttribute('data-id');
        var statGroups = itemSearchGroupsVueItems();
        var markedAny = false;

        row.querySelectorAll('[data-field^="stat."]').forEach(function(statElement) {
          var field = statElement.getAttribute('data-field') || '';
          var modHash = getStatHash(field);
          if (!modHash) return;

          var mod = findModContainer(statElement);
          if (markMod(mod, rowId, modHash, statGroups)) markedAny = true;
        });

        if (markedAny) {
          row.classList.add('bt-mod-filter-processed');
          return true;
        }
      } catch (_error) {
        // Keep processing other rows even if one fails.
      }

      return false;
    };

    var processAllRows = function() {
      document.querySelectorAll(ROW_SELECTOR).forEach(processRow);
      updateDiagnostics();
    };

    var watchRowForContent = function(row) {
      if (!row || rowWatchers.has(row)) return;

      processRow(row);

      var observer = new MutationObserver(function() {
        if (processRow(row)) {
          updateDiagnostics();
        }
      });

      observer.observe(row, {childList: true, subtree: true});
      rowWatchers.set(row, observer);

      window.setTimeout(function() {
        if (rowWatchers.get(row) === observer) {
          observer.disconnect();
          rowWatchers.delete(row);
        }
      }, 8000);
    };

    var onEnter = function(selector, handler) {
      document.addEventListener('mouseover', function(event) {
        var element = event.target.closest(selector);
        if (!element) return;

        var relatedTarget = event.relatedTarget;
        if (relatedTarget && (relatedTarget === element || element.contains(relatedTarget))) return;

        handler.call(element, event, element);
      });
    };

    var onLeave = function(selector, handler) {
      document.addEventListener('mouseout', function(event) {
        var element = event.target.closest(selector);
        if (!element) return;

        var relatedTarget = event.relatedTarget;
        if (relatedTarget && (relatedTarget === element || element.contains(relatedTarget))) return;

        handler.call(element, event, element);
      });
    };

    var onClick = function(selector, handler) {
      document.addEventListener('click', function(event) {
        var element = event.target.closest(selector);
        if (!element) return;

        handler.call(element, event, element);
      });
    };

    var addOrRemoveFilter = function(_event, isAnd, button) {
      var filterType = isAnd ? 'and' : 'not';
      var modElement = button.closest(MOD_CONTAINER_SELECTOR);
      var rowId = modElement && modElement.dataset ? modElement.dataset.rowid : '';
      var vueElement = findVueResultItem(rowId) || {};
      var statHash = modElement && modElement.dataset ? modElement.dataset.hash : '';
      var newFilter = createFilter(statHash);

      if (!newFilter) return;

      var group = findTargetStatGroup(filterType);
      var applied = false;

      if (group && typeof group.selectFilter === 'function') {
        group.selectFilter(newFilter);
        applied = true;
      } else {
        var store = getVueStore(vueElement);
        if (store && typeof store.commit === 'function') {
          store.commit('pushStatGroup', {type: filterType, filters: [newFilter]});
          applied = true;
        }
      }

      if (!applied) return;

      if (window.app && typeof window.app.save === 'function') {
        window.app.save(true);
      }

      triggerSearch();

      try {
        var message =
          'Stat ' + (isAnd ? 'added to' : 'excluded from') + ' your search filters.';
        var translated =
          vueElement.translate &&
          vueElement.translate(
            'the stat ' + statHash + ' has been ' + (isAnd ? 'added to' : 'removed from') + ' your stat filters.'
          );

        if (typeof translated === 'string' && translated) {
          message = translated;
        }

        if (window.app && window.app.$refs && window.app.$refs.toastr) {
          window.app.$refs.toastr.Add({msg: message, progressbar: false, timeout: 3000});
        }
      } catch (_error) {
        // Toast is optional.
      }
    };

    processAllRows();

    var resultsRoot = document.querySelector('.results') || document.querySelector('.resultset');
    if (resultsRoot) {
      var processScheduled = false;
      var scheduleProcess = function() {
        if (processScheduled) return;
        processScheduled = true;
        window.requestAnimationFrame(function() {
          processScheduled = false;
          processAllRows();
        });
      };

      new MutationObserver(scheduleProcess).observe(resultsRoot, {childList: true, subtree: true});
    }

    var reprocessAttempts = 0;
    var reprocessTimer = window.setInterval(function() {
      reprocessAttempts += 1;
      processAllRows();

      if (document.querySelectorAll('.bt-mod-filterable').length > 0 || reprocessAttempts >= 60) {
        window.clearInterval(reprocessTimer);
      }
    }, 1000);

    onEnter(ROW_SELECTOR, function(_event, row) {
      watchRowForContent(row);
    });

    onEnter(MOD_HOVER_SELECTOR, function(_event, element) {
      var row = element.closest(ROW_SELECTOR);
      if (row) watchRowForContent(row);

      if (!element.classList.contains('bt-mod-filterable')) return;

      attachButtons(element);
    });

    onLeave(MOD_HOVER_SELECTOR, function(_event, element) {
      var buttons = element.querySelector('.bt-mod-filter-btns');
      if (buttons) buttons.remove();
    });

    onClick('[data-action="bt-add-filter"]', function(event, button) {
      event.preventDefault();
      event.stopPropagation();
      addOrRemoveFilter(event, true, button);
    });

    onClick('[data-action="bt-rmv-filter"]', function(event, button) {
      event.preventDefault();
      event.stopPropagation();
      addOrRemoveFilter(event, false, button);
    });
  }

  boot();
})();

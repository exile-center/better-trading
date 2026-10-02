// Vendor
import {expect} from 'chai';
import {setupTest} from 'ember-mocha';
import {afterEach, beforeEach, describe, it} from 'mocha';
import sinon from 'sinon';

// Types
import CopyItem from 'better-trading/services/item-results/enhancers/copy-item';
import TradeLocation from 'better-trading/services/trade-location';

// HTML Samples
import Headhunter from 'better-trading/tests/html-samples/item-results/poe2-headhunter-current';

describe('Unit | Services | ItemResults | Enhancers | CopyItem', () => {
  setupTest();

  let service: CopyItem;
  let itemElement: HTMLDivElement;
  let button: HTMLButtonElement;
  let sandbox: sinon.SinonSandbox;
  let execCommand: sinon.SinonStub;
  let copiedText: string;
  let nativeCopy: sinon.SinonSpy;

  beforeEach(function () {
    service = this.owner.lookup('service:item-results/enhancers/copy-item');
    service.tradeLocation = {version: '2'} as TradeLocation;
    service.intl.setLocale('en');
    sandbox = sinon.createSandbox();
    sandbox.stub(service.flashMessages, 'success');
    sandbox.stub(service.flashMessages, 'alert');
    sandbox.stub(console, 'warn');
    copiedText = '';
    execCommand = sandbox.stub(document, 'execCommand').callsFake(() => {
      copiedText = (document.activeElement as HTMLTextAreaElement).value;
      return true;
    });

    itemElement = document.createElement('div');
    itemElement.className = 'row';
    itemElement.innerHTML = `
      <div class="left"><button class="copy hidden" style="display: none;"></button></div>
      ${Headhunter}
    `;
    document.body.appendChild(itemElement);
    button = itemElement.querySelector('button.copy') as HTMLButtonElement;
    nativeCopy = sinon.spy();
    button.addEventListener('click', nativeCopy);
  });

  afterEach(() => {
    itemElement.remove();
    sandbox.restore();
  });

  it('copies the captured live PoE2 item in native format instead of invoking the empty native handler', () => {
    service.enhance(itemElement);
    button.click();

    expect(execCommand).to.have.been.calledOnceWithExactly('copy');
    expect(copiedText).to.equal(
      [
        'Item Class: Belts',
        'Rarity: Unique',
        'Headhunter',
        'Heavy Belt',
        '--------',
        'Requirements:',
        'Level: 50',
        '--------',
        'Item Level: 81',
        '--------',
        '30% increased Stun Threshold (implicit)',
        'Has 1 Charm Slot (implicit)',
        '--------',
        '+49 to maximum Life',
        '+29 to Strength',
        '+21 to Dexterity',
        'When you kill a Rare monster, you gain its Modifiers for 60 seconds',
        '--------',
        'Corrupted',
        '--------',
        'Note: ~b/o 300 chaos',
      ].join('\n')
    );
    expect(nativeCopy).not.to.have.been.called;
    expect(service.flashMessages.success).to.have.been.calledOnce;
    expect(service.flashMessages.alert).not.to.have.been.called;
  });

  it('leaves PoE1 native copying untouched', () => {
    service.set('tradeLocation', {version: '1'} as TradeLocation);
    service.enhance(itemElement);
    button.click();

    expect(nativeCopy).to.have.been.calledOnce;
    expect(execCommand).not.to.have.been.called;
  });

  it('uses native PoE2 copying when the site supplies item text', () => {
    service.enhance(itemElement);
    button.classList.remove('hidden');
    button.style.removeProperty('display');
    button.click();

    expect(nativeCopy).to.have.been.calledOnce;
    expect(execCommand).not.to.have.been.called;
  });

  it('keeps the clipboard intact if the item is not rendered yet', () => {
    service.enhance(itemElement);
    itemElement.querySelector('.middle')?.remove();
    button.click();

    expect(execCommand).not.to.have.been.called;
    expect(nativeCopy).not.to.have.been.called;
    expect(service.flashMessages.alert).to.have.been.calledOnceWithExactly(
      service.intl.t('item-results.copy-item.unreadable')
    );
    expect(service.flashMessages.success).not.to.have.been.called;
  });

  it('reports a failed clipboard write without reporting success', () => {
    execCommand.returns(false);
    service.enhance(itemElement);
    button.click();

    expect(service.flashMessages.alert).to.have.been.calledOnceWithExactly(
      service.intl.t('item-results.copy-item.clipboard-failed')
    );
    expect(service.flashMessages.success).not.to.have.been.called;
    expect(document.querySelector('textarea')).to.equal(null);
  });

  it('cleans up the temporary textarea if clipboard access throws', () => {
    execCommand.throws(new Error('Clipboard unavailable'));
    service.enhance(itemElement);
    button.click();

    expect(service.flashMessages.alert).to.have.been.calledOnceWithExactly(
      service.intl.t('item-results.copy-item.clipboard-failed')
    );
    expect(service.flashMessages.success).not.to.have.been.called;
    expect(document.querySelector('textarea')).to.equal(null);
  });
});

import Service from '@ember/service';

// placeholder values for the item type/name field and the stat filter dropdown
const en: string[] = ['Search Items...', '+ Add Stat Filter'];
const pt: string[] = ['Pesquisar Itens...', '+ Adicionar Filtro de Atributo'];
const ru: string[] = ['Поиск предметов...', '+ Добавить фильтр свойств'];
const th: string[] = ['ค้นหาไอเทม...', '+ เพิ่มตัวกรองม็อด'];
const de: string[] = ['Gegenstände suchen ...', '+ Filter hinzufügen'];
const fr: string[] = ["Recherche d'objets...", '+ Filtrer des stats'];
const sp: string[] = ['Buscar objetos...', '+ Agregar filtro de estadísticas'];
const jp: string[] = ['アイテムを検索...', '+ スタッツフィルターを追加'];
// const kr: string[] = []; Can't get on the KR trade site to collect strings

const PLACEHOLDERS: string[] = [...en,
                                ...pt,
                                ...ru,
                                ...th,
                                ...de,
                                ...fr,
                                ...sp,
                                ...jp
                            ];

const INPUT_CLASS: string = '.multiselect__input'

export default class PrependTilde extends Service {
    /** Use fuzzy matching when the user types in the Item Name/Type or Stat Filter fields.
     *  Prepends with '~' as the user types in these fields.
     * */

    observer: MutationObserver | null = null;
    
    onDOMReady(callback: () => void) {
        if (['complete', 'interactive'].includes(document.readyState)) {
            callback();
        } else {
            document.addEventListener('DOMContentLoaded', () => callback());
        }
    }
    
    initialize() {
        this.onDOMReady(() => {
            this.startObserver();
            this.attachToExistingFields();
        })
    }

    startObserver() {
        this.observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of Array.from(mutation.addedNodes)) {
                    if (!(node instanceof HTMLElement)) continue;

                    if (node instanceof HTMLInputElement &&
                        node.classList.contains(INPUT_CLASS) &&
                        PLACEHOLDERS.includes(node.placeholder)
                    ) {
                        this.attachListener(node)
                    }

                    const matchingChildren = Array.from(
                        node.querySelectorAll<HTMLInputElement>(`input${INPUT_CLASS}`)
                    ).filter((el) => PLACEHOLDERS.includes(el.placeholder))

                    matchingChildren.forEach((input) => this.attachListener(input))
                }
            }
        });


        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    attachListener(el: HTMLInputElement) {
        el.addEventListener('keydown', () => {
            if (!el.value.startsWith('~')) {
                const cursorPos = el.selectionStart ?? 0;
                el.value = `~${el.value}`;
                el.setSelectionRange(cursorPos + 1, cursorPos + 1);

                // let Vue know the value changed
                el.dispatchEvent(new Event('input', {bubbles: true}));
            }
        });
    }

    attachToExistingFields() {
        const inputs = document.querySelectorAll<HTMLInputElement>(INPUT_CLASS);

        const matchingInputs = Array.from(inputs).filter((input) => 
            PLACEHOLDERS.includes(input.placeholder)
        );

        matchingInputs.forEach((input) => {
            this.attachListener(input)
        });
    }
}

declare module '@ember/service' {
  interface Registry {
    'prepend-tilde': PrependTilde;
  }
}
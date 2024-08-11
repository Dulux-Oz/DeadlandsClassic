/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-syntax */
import { Chips } from '../helpers/chips.mjs';
import { DLCActorSheetBase } from './actor-sheet-base.mjs';

const { api } = foundry.applications;

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheetV2}
 */
export class DLCActorSheet extends api.HandlebarsApplicationMixin(
  DLCActorSheetBase
) {
  constructor(options = {}) {
    super(options);
    this.#dragDrop = this.#createDragDropHandlers();
  }

  /* -------------------------------------------- */
  /* Set up Drag and Drop                         */
  /* -------------------------------------------- */

  // The following pieces set up drag handling and are unlikely to
  // need modification.

  get dragDrop() {
    return this.#dragDrop;
  }

  // This is marked as private because there's no real need
  // for subclasses or external hooks to mess with it directly
  #dragDrop;

  /**
   * Create drag-and-drop workflow handlers for this Application
   * @returns {DragDrop[]}     An array of DragDrop handlers
   * @private
   */
  #createDragDropHandlers() {
    return this.options.dragDrop.map((d) => {
      d.permissions = {
        dragstart: this._canDragStart.bind(this),
        drop: this._canDragDrop.bind(this),
      };
      d.callbacks = {
        dragstart: this._onDragStart.bind(this),
        dragover: this._onDragOver.bind(this),
        drop: this._onDrop.bind(this),
      };
      return new DragDrop(d);
    });
  }

  /**
   * Actions performed after any render of the Application.
   * Post-render steps are not awaited by the render process.
   * @param {ApplicationRenderContext} context      Prepared context data
   * @param {RenderOptions} options                 Provided render options
   * @protected
   */
  _onRender(context, options) {
    this.#dragDrop.forEach((d) => d.bind(this.element));
  }

  /* -------------------------------------------- */

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ['dlc', 'sheet', 'actor'],
    position: {
      width: 840,
      height: 800,
    },
    window: {
      resizable: true,
    },
    actions: {
      consumeGreen: this._consumeGreen,
      convertBlue: this._convertBlue,
      convertGreen: this._convertGreen,
      convertRed: this._convertRed,
      convertTemporaryGreen: this._convertTemporaryGreen,
      convertWhite: this._convertWhite,
      drawOne: this._drawOne,
      drawThree: this._drawThree,
      editItem: this._editItem,
      removeItem: this._removeItem,
      useBlue: this._useBlue,
      useGreen: this._useGreen,
      useRed: this._useRed,
      useRedReroll: this._useRedReroll,
      useTemporaryGreen: this._useTemporaryGreen,
      useWhite: this._useWhite,
    },
    // Custom property that's merged into `this.options`
    dragDrop: [{ dragSelector: '[data-drag]', dropSelector: null }],
    form: {
      submitOnChange: true,
    },
  };

  /** @override */
  static PARTS = {
    header: {
      template: 'systems/deadlands-classic/templates/char-show/header.hbs',
    },
    tabs: {
      // Foundry-provided generic template
      template: 'templates/generic/tab-navigation.hbs',
    },
    traits: {
      template: 'systems/deadlands-classic/templates/char-show/traits.hbs',
      scrollable: [''],
    },
    aptitudes: {
      template: 'systems/deadlands-classic/templates/char-show/aptitudes.hbs',
      scrollable: [''],
    },
    combat: {
      template: 'systems/deadlands-classic/templates/char-show/combat.hbs',
      scrollable: [''],
    },
    chips: {
      template: 'systems/deadlands-classic/templates/char-show/chips.hbs',
      scrollable: [''],
    },
    edges: {
      template: 'systems/deadlands-classic/templates/char-show/edges.hbs',
      scrollable: [''],
    },
    inventory: {
      template: 'systems/deadlands-classic/templates/char-show/inventory.hbs',
      scrollable: [''],
    },
    guns: {
      template: 'systems/deadlands-classic/templates/char-show/guns.hbs',
      scrollable: [''],
    },
    melee: {
      template: 'systems/deadlands-classic/templates/char-show/melee.hbs',
      scrollable: [''],
    },
    otherRanged: {
      template: 'systems/deadlands-classic/templates/char-show/otherRanged.hbs',
      scrollable: [''],
    },
    misc: {
      template: 'systems/deadlands-classic/templates/char-show/misc.hbs',
      scrollable: [''],
    },
    spells: {
      template: 'systems/deadlands-classic/templates/char-show/spells.hbs',
      scrollable: [''],
    },
    biodata: {
      template: 'systems/deadlands-classic/templates/char-show/biodata.hbs',
      scrollable: [''],
    },
    biography: {
      template: 'systems/deadlands-classic/templates/char-show/biography.hbs',
      scrollable: [''],
    },
    notes: {
      template: 'systems/deadlands-classic/templates/char-show/notes.hbs',
      scrollable: [''],
    },
  };

  /* Unfortunately need this. The standard changeTab wasn't handling a secondary 
     set of tabs under the inventory primary tab. They were not getting the
     active class removed from their classlist. This meant that once they have
     been displayed, they never go away.
     
     When any primary tab is clicked, this operation sets the secondary tabs'
     consfig appropraitely. It clears all active flags from the sub-tabs when
     any primary tab other than the one containing the sub-tabs is selected.
    
     When the primary tab containing the secondary tabs (inventory) is selected,
     this operation ensures that only the tab in this.tabGroups.secondary is
     active.
    
     It then calls the super operation to do the actual change tab. Prettier
     ignored because the lines aren't that long and it makes a right 
     unreadable mess of them if you let it. */

  // prettier-ignore
  changeTab(tab, group, { event, navElement, force = false, updatePosition = true } = {}) {
    if (group === 'primary' && tab === 'inventory') {
      const content = this.hasFrame
        ? this.element.querySelector('.window-content')
        : this.element;

        for (const section of content.querySelectorAll(`.tab[data-group="secondary"]`)) {
          section.classList.toggle('active', section.dataset.tab === this.tabGroups.secondary);
        }
      }

    super.changeTab(tab, group, { event, navElement, force, updatePosition });
  }

  // prettier-ignore
  #fixSubTabs(tab, group) {
    if (group === 'primary') {
      const content = this.hasFrame
        ? this.element.querySelector('.window-content')
        : this.element;

      if (tab === 'inventory') {
        for (const section of content.querySelectorAll(`.tab[data-group="secondary"]`)) {
          section.classList.toggle('active', section.dataset.tab === this.tabGroups.secondary);
        }
      } else {
        for (const section of content.querySelectorAll(`.tab[data-group="secondary"]`)) {
          section.classList.toggle('active', false);
        }
      }
    }
  }

  async _prepareContext(options) {
    let context = await super._prepareContext(options);

    const intialiseSecondary = !this.tabGroups.secondary;

    // Default tab for first time it's rendered this session
    if (!this.tabGroups.primary) this.tabGroups.primary = 'aptitudes';
    if (intialiseSecondary) this.tabGroups.secondary = 'guns';

    const activateSecondary = this.tabGroups.primary === 'inventory';

    const activateguns =
      activateSecondary && this.tabGroups.secondary === 'guns';
    const activatemelee =
      activateSecondary && this.tabGroups.secondary === 'melee';
    const activateranged =
      activateSecondary && this.tabGroups.secondary === 'otherRanged';
    const activatemisc =
      activateSecondary && this.tabGroups.secondary === 'misc';

    context = foundry.utils.mergeObject(context, {
      tabs: this._getTabs(options.parts),
      inventoryTabs: {
        guns: {
          cssClass: activateguns ? 'active' : '',
          group: 'secondary',
          id: 'guns',
          label: 'DLC.tab.guns',
        },
        melee: {
          cssClass: activatemelee ? 'active' : '',
          group: 'secondary',
          id: 'melee',
          label: 'DLC.tab.melee',
        },
        otherRanged: {
          cssClass: activateranged ? 'active' : '',
          group: 'secondary',
          id: 'otherRanged',
          label: 'DLC.tab.otherRanged',
        },
        misc: {
          cssClass: activatemisc ? 'active' : '',
          group: 'secondary',
          id: 'misc',
          label: 'DLC.tab.misc',
        },
      },
    });

    return context;
  }

  /** @override */
  async _preparePartContext(partId, context) {
    switch (partId) {
      case 'guns':
      case 'melee':
      case 'otherRanged':
      case 'misc':
        context.tab = context.inventoryTabs[partId];
        break;
      case 'aptitudes':
      case 'biodata':
      case 'chips':
      case 'combat':
      case 'edges':
      case 'inventory':
      case 'spells':
      case 'traits':
        context.tab = context.tabs[partId];
        break;
      case 'biography':
        context.tab = context.tabs[partId];

        // Enrich biography info for display
        context.enrichedBiography = await TextEditor.enrichHTML(
          this.actor.system.biography,
          {
            // Whether to show secret blocks in the finished html
            secrets: this.document.isOwner,
            // Data to fill in for inline rolls
            rollData: this.actor.getRollData(),
            // Relative UUID resolution
            relativeTo: this.actor,
          }
        );
        break;
      case 'notes':
        context.tab = context.tabs[partId];

        // Enrich notes info for display
        context.enrichedNotes = await TextEditor.enrichHTML(
          this.actor.system.notes,
          {
            // Whether to show secret blocks in the finished html
            secrets: this.document.isOwner,
            // Data to fill in for inline rolls
            rollData: this.actor.getRollData(),
            // Relative UUID resolution
            relativeTo: this.actor,
          }
        );
        break;
      default:
    }
    return context;
  }

  /**
   * Generates the data for the generic tab navigation template
   * @param {string[]} parts An array of named template parts to render
   * @returns {Record<string, Partial<ApplicationTab>>}
   * @protected
   */
  _getTabs(parts) {
    return {
      aptitudes: {
        cssClass: this.tabGroups.primary === 'aptitudes' ? 'active' : '',
        group: 'primary',
        id: 'aptitudes',
        label: 'DLC.tab.aptitudes',
      },
      biodata: {
        cssClass: this.tabGroups.primary === 'biodata' ? 'active' : '',
        group: 'primary',
        id: 'biodata',
        label: 'DLC.tab.biodata',
      },
      chips: {
        cssClass: this.tabGroups.primary === 'chips' ? 'active' : '',
        group: 'primary',
        id: 'chips',
        label: 'DLC.tab.chips',
      },
      combat: {
        cssClass: this.tabGroups.primary === 'combat' ? 'active' : '',
        group: 'primary',
        id: 'combat',
        label: 'DLC.tab.combat',
      },
      edges: {
        cssClass: this.tabGroups.primary === 'edges' ? 'active' : '',
        group: 'primary',
        id: 'edges',
        label: 'DLC.tab.edges',
      },
      inventory: {
        cssClass: this.tabGroups.primary === 'inventory' ? 'active' : '',
        group: 'primary',
        id: 'inventory',
        label: 'DLC.tab.inventory',
      },
      spells: {
        cssClass: this.tabGroups.primary === 'spells' ? 'active' : '',
        group: 'primary',
        id: 'spells',
        label: 'DLC.tab.spells',
      },
      traits: {
        cssClass: this.tabGroups.primary === 'traits' ? 'active' : '',
        group: 'primary',
        id: 'traits',
        label: 'DLC.tab.traits',
      },
      biography: {
        cssClass: this.tabGroups.primary === 'biography' ? 'active' : '',
        group: 'primary',
        id: 'biography',
        label: 'DLC.tab.biography',
      },
      notes: {
        cssClass: this.tabGroups.primary === 'notes' ? 'active' : '',
        group: 'primary',
        id: 'notes',
        label: 'DLC.tab.notes',
      },
    };
  }

  /* -------------------------------------------- */
  /*  Drag and Drop                               */
  /* -------------------------------------------- */

  /** @inheritdoc */
  _canDragStart(selector) {
    return this.isEditable;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  _canDragDrop(selector) {
    return this.isEditable;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  _onDragStart(event) {
    const li = event.currentTarget;
    if ('link' in event.target.dataset) return;

    // Create drag data
    let dragData;

    // Owned Items
    if (li.dataset.itemId) {
      const item = this.actor.items.get(li.dataset.itemId);
      dragData = item.toDragData();
    }

    // Active Effect
    if (li.dataset.effectId) {
      const effect = this.actor.effects.get(li.dataset.effectId);
      dragData = effect.toDragData();
    }

    if (!dragData) return;

    // Set data transfer
    event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
  }

  /**
   * Callback actions which occur when a dragged element is over a drop target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  // eslint-disable-next-line class-methods-use-this
  _onDragOver(event) {}

  /* -------------------------------------------- */

  /** @inheritdoc */
  async _onDrop(event) {
    const data = TextEditor.getDragEventData(event);
    const { actor } = this;
    const allowed = Hooks.call('dropActorSheetData', actor, this, data);
    if (allowed === false) return false;

    // Handle different data types
    switch (data.type) {
      case 'Item':
        return this._onDropItem(event, data);
      // case 'ActiveEffect':
      //   return this._onDropActiveEffect(event, data);
      // case 'Folder':
      //   return this._onDropFolder(event, data);
      default:
        return false;
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle dropping of an item reference or item data onto an Actor Sheet
   * @param {DragEvent} event            The concluding DragEvent which contains drop data
   * @param {object} data                The data transfer extracted from the event
   * @returns {Promise<Item[]|boolean>}  The created or updated Item instances, or false if the drop was not permitted.
   * @protected
   */
  async _onDropItem(event, data) {
    if (!this.actor.isOwner) return false;
    const item = await Item.implementation.fromDropData(data);

    // Can't add or sort Character modifications with drag and drop on the actor.
    if (item.isCharacterMod) return false;

    const itemData = item.toObject();

    // Handle item sorting within the same Actor
    if (this.actor.uuid === item.parent?.uuid)
      return this._onSortItem(event, itemData);

    // Create the owned item
    return this._onDropItemCreate(itemData, event);
  }

  /* -------------------------------------------- */

  /**
   * Handle the final creation of dropped Item data on the Actor.
   * This method is factored out to allow downstream classes the opportunity to override item creation behavior.
   * @param {object[]|object} itemData      The item data requested for creation
   * @param {DragEvent} event               The concluding DragEvent which provided the drop data
   * @returns {Promise<Item[]>}
   * @private
   */
  async _onDropItemCreate(itemData, event) {
    const arrayofItems = itemData instanceof Array ? itemData : [itemData];
    return this.actor.createEmbeddedDocuments('Item', arrayofItems);
  }

  /* -------------------------------------------- */

  /**
   * Handle a drop event for an existing embedded Item to sort that Item relative to its siblings
   * @param {Event} event
   * @param {Object} itemData
   * @private
   */
  _onSortItem(event, itemData) {
    // Get the drag source and drop target
    const { items } = this.actor;
    const source = items.get(itemData._id);
    const dropTarget = event.target.closest('[data-item-id]');
    if (!dropTarget) return false;
    const target = items.get(dropTarget.dataset.itemId);

    // Don't sort on yourself
    if (source.id === target.id) return false;

    // Identify sibling items based on adjacent HTML elements
    const siblings = [];
    for (const el of dropTarget.parentElement.children) {
      const siblingId = el.dataset.itemId;
      if (siblingId && siblingId !== source.id)
        siblings.push(items.get(el.dataset.itemId));
    }

    // Perform the sort
    const sortUpdates = SortingHelpers.performIntegerSort(source, {
      target,
      siblings,
    });
    const updateData = sortUpdates.map((u) => {
      const { update } = u;
      update._id = u.target._id;
      return update;
    });

    // Perform the update
    return this.actor.updateEmbeddedDocuments('Item', updateData);
  }

  /* -------------------------------------------- */
  /*  Sheet actions                               */
  /* -------------------------------------------- */

  static async _useWhite(event, target) {
    event.preventDefault();
    event.stopPropagation();
    await game['deadlands-classic'].socket.executeAsGM(
      'socketUseChipActor',
      this.document.id,
      Chips.type.White
    );
    this.render();
  }

  static async _useRedReroll(event, target) {
    event.preventDefault();
    event.stopPropagation();
    await game['deadlands-classic'].socket.executeAsGM(
      'socketRedRerollActor',
      this.document.id
    );
    this.render();
  }

  static async _useRed(event, target) {
    event.preventDefault();
    event.stopPropagation();
    await game['deadlands-classic'].socket.executeAsGM(
      'socketUseChipActor',
      this.document.id,
      Chips.type.Red
    );
    this.render();
  }

  static async _editItem(event, target) {
    event.preventDefault();
    const element = event.target;
    const { id } = element.dataset;
    const item = this.document.items.get(id);
    item.ownedItemEditor.render({ force: true });
  }

  static async _removeItem(event, target) {
    event.preventDefault();
    const element = event.target;
    const { id } = element.dataset;
    return this.actor.deleteEmbeddedDocuments('Item', [id]);
  }

  static async _useBlue(event, target) {
    event.preventDefault();
    event.stopPropagation();
    await game['deadlands-classic'].socket.executeAsGM(
      'socketUseChipActor',
      this.document.id,
      Chips.type.Blue
    );
    this.render();
  }

  static async _useGreen(event, target) {
    event.preventDefault();
    event.stopPropagation();
    await game['deadlands-classic'].socket.executeAsGM(
      'socketUseChipActor',
      this.document.id,
      Chips.type.Green
    );
    this.render();
  }

  static async _useTemporaryGreen(event, target) {
    event.preventDefault();
    event.stopPropagation();
    await game['deadlands-classic'].socket.executeAsGM(
      'socketUseChipActor',
      this.document.id,
      Chips.type.TemporaryGreen
    );
    this.render();
  }

  static async _convertWhite(event, target) {
    event.preventDefault();
    event.stopPropagation();
    await game['deadlands-classic'].socket.executeAsGM(
      'socketConvertChipActor',
      this.document.id,
      Chips.type.White
    );
    this.render();
  }

  static async _convertRed(event, target) {
    event.preventDefault();
    event.stopPropagation();
    await game['deadlands-classic'].socket.executeAsGM(
      'socketConvertChipActor',
      this.document.id,
      Chips.type.Red
    );
    this.render();
  }

  static async _convertBlue(event, target) {
    event.preventDefault();
    event.stopPropagation();
    await game['deadlands-classic'].socket.executeAsGM(
      'socketConvertChipActor',
      this.document.id,
      Chips.type.Blue
    );
    this.render();
  }

  static async _convertGreen(event, target) {
    event.preventDefault();
    event.stopPropagation();
    await game['deadlands-classic'].socket.executeAsGM(
      'socketConvertChipActor',
      this.document.id,
      Chips.type.Green
    );
    this.render();
  }

  static async _convertTemporaryGreen(event, target) {
    event.preventDefault();
    event.stopPropagation();
    await game['deadlands-classic'].socket.executeAsGM(
      'socketConvertChipActor',
      this.document.id,
      Chips.type.TemporaryGreen
    );
    this.render();
  }

  static async _consumeGreen(event, target) {
    event.preventDefault();
    event.stopPropagation();
    await game['deadlands-classic'].socket.executeAsGM(
      'socketConsumeGreenChipActor',
      this.document.id
    );
    this.render();
  }

  static async _drawOne(event, target) {
    event.preventDefault();
    event.stopPropagation();
    await game['deadlands-classic'].socket.executeAsGM(
      'socketDrawChipActor',
      this.document.id,
      1
    );
    this.render();
  }

  static async _drawThree(event, target) {
    event.preventDefault();
    event.stopPropagation();
    await game['deadlands-classic'].socket.executeAsGM(
      'socketDrawChipActor',
      this.document.id,
      3
    );
    this.render();
  }
}

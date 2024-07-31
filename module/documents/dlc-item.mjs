/* eslint-disable no-underscore-dangle */
import { ActorModSheet } from '../sheets/item/edit-sheet-actor-mod.mjs';
import { EditGunSheet } from '../sheets/item/edit-sheet-gun.mjs';
import { EditMeleeSheet } from '../sheets/item/edit-sheet-melee.mjs';
import { EditMiscItemSheet } from '../sheets/item/edit-sheet-misc-item.mjs';
import { EditOtherRangedItemSheet } from '../sheets/item/edit-sheet-other-ranged-item.mjs';

export class DeadlandsItem extends Item {
  constructor(data, context) {
    super(data, context);

    Object.defineProperty(this, '_modEditor', {
      value: null,
      writable: true,
      enumerable: false,
    });

    Object.defineProperty(this, '_gunEditor', {
      value: null,
      writable: true,
      enumerable: false,
    });

    Object.defineProperty(this, '_meleeEditor', {
      value: null,
      writable: true,
      enumerable: false,
    });

    Object.defineProperty(this, '_otherRangedEditor', {
      value: null,
      writable: true,
      enumerable: false,
    });

    Object.defineProperty(this, '_itemEditor', {
      value: null,
      writable: true,
      enumerable: false,
    });
  }

  /* -------------------------------------------- */

  /* Lazily get a sheet that deals with item editing. */
  get itemEditor() {
    if (
      this.type === 'edge' ||
      this.type === 'hindrance' ||
      this.type === 'spellLike'
    ) {
      return new ActorModSheet({
        document: this,
        editable: true,
      });
    }

    if (this.type === 'gun') {
      return new EditGunSheet({
        document: this,
        editable: true,
      });
    }
    if (this.type === 'melee') {
      return new EditMeleeSheet({
        document: this,
        editable: true,
      });
    }

    if (this.type === 'otherRanged') {
      return new EditOtherRangedItemSheet({
        document: this,
        editable: true,
      });
    }

    return new EditMiscItemSheet({
      document: this,
      editable: true,
    });
  }

  /* -------------------------------------------- */

  _getSheetClass() {
    const found = super._getSheetClass();

    return found;
  }
}

/* eslint-disable no-underscore-dangle */
import { EditEdgeSheet } from '../sheets/edit-sheet-edge.mjs';
import { EditGunSheet } from '../sheets/edit-sheet-gun.mjs';
import { EditMeleeSheet } from '../sheets/edit-sheet-melee.mjs';
import { EditMiscItemSheet } from '../sheets/edit-sheet-misc-item.mjs';
import { EditOtherRangedSheet } from '../sheets/edit-sheet-other-ranged.mjs';

export class DeadlandsItem extends Item {
  constructor(data, context) {
    super(data, context);

    /* This will hold the application used when modifying a DeadlandsActor */
    Object.defineProperty(this, '_itemEditor', {
      value: null,
      writable: true,
      enumerable: false,
    });
  }

  /* -------------------------------------------- */

  /* Lazily get a sheet that deals with item editing. */
  get itemEditor() {
    if (!this._itemEditor) {
      if (
        this.type === 'edge' ||
        this.type === 'hinderance' ||
        this.type === 'spellLike'
      ) {
        this._itemEditor = new EditEdgeSheet(this, { editable: true });
      } else if (this.type === 'gun') {
        this._itemEditor = new EditGunSheet(this, { editable: true });
      } else if (this.type === 'melee') {
        this._itemEditor = new EditMeleeSheet(this, { editable: true });
      } else if (this.type === 'otherRanged') {
        this._itemEditor = new EditOtherRangedSheet(this, { editable: true });
      } else {
        this._itemEditor = new EditMiscItemSheet(this, { editable: true });
      }
    }
    return this._itemEditor;
  }

  /* -------------------------------------------- */

  _getSheetClass() {
    const found = super._getSheetClass();

    return found;
  }
}

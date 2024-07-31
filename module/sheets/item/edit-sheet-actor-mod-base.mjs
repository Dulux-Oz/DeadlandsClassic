/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
const { sheets } = foundry.applications;

export class ActorModSheetBase extends sheets.ItemSheetV2 {
  /** @override */

  async _prepareContext(options) {
    const { isEditable } = this;

    const { grantsArcane, isArcane } = this.document.system;
    const showArcaneType = !!(grantsArcane || isArcane);

    return {
      cssClass: isEditable ? 'editable' : 'locked',
      editable: isEditable,
      limited: this.document.limited,
      name: this.document.name,
      options: this.options,
      owner: this.document.isOwner,
      system: this.item.system,
      title: this.title,
      img: this.document.img,
      showArcaneType,
    };
  }
}

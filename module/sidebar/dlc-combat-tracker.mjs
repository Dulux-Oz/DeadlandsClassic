export class DeadlandsCombatTracker extends CombatTracker {
  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(
      super.defaultOptions,
      {
        template:
          'systems/deadlands-classic/templates/sidebar/combat-tracker.html',
      },
      { overwrite: true }
    );
  }
}

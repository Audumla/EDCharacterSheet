var ActionProperties = {
  // Static cell locations for property values that are not stored as native properties. These will be accessed using the property key ie "CharacterKarmaSpent"
  // Properties that are listed in a range such as items, are named using the CHARACTERISTIC & PROPERTY identifiers. ie ItemQuantity
  // This variable points to an array with the first value being a range that the TARGET identifier can be searched for, followed by the top row location of the corresponding VALUE identifier. 
  // This will be used to update the VALUE based on the same index that TARGET was located
  propertyLocations : {
    CharacterKarmaSpent : "Stats!M7",
    CharacterKarmaConverted : "Stats!M6",
    HealthDamageValue : "Stats!M12",
    HealthRecoverySpent : "Stats!M13",
    HealthWoundsValue : "Stats!M14",
    ItemQuantity : "Items!G3"
  },

  // location names for data required for executing actions
  actionLocations : {
    seedProperties : "ActionScriptProperties",
    //seedPropertiesIndex : null, // lookup index can be built using the seed properties if null
    actionPropertyResults : "ActionPropertyResults",
    actionLog : "ActionLog",
    actionResult : "ActionResultNumber",
    actionTarget : "ActionTargetNumber",
    ItemQuantity : "Items!B3:B70"
  },

  // dynamically populated values based on the actionLocations
  actionValues : {

  }
}
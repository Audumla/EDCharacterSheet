var CharacterSheetLocations = {
  SeedProperties : "ActionScriptProperties", // location of the character properties to load
  SeedPropertiesIndex : null,// location for key index of the character properties. If null this will be built on the fly
  ActionPropertyResults : "ActionPropertyResults", // location of where to add/update properties
  WeaponName : "ActionWeaponName", // location for the active weapon name
  TalentName : "ActionTalentName", // location for the active talent/skill name
  ResultLocation : "ActionResultNumber", // where to output the result of a dice roll
  TargetLocation : "ActionTargetNumber", // where to output the target number used in a dice roll 
  ActionLog : "ActionLog" // where to write log messages
}



function onOpen() {

  ED4eFunctions.onOpen();  
  // Create some action menu items
  var ui = SpreadsheetApp.getUi();
  // Or DocumentApp or FormApp.
  ui.createMenu('ED Menu')
      .addItem('Roll Selected Dice', 'ED4eFunctions.RollSelected')
      .addItem('Roll Initiative', 'ED4eFunctions.rollInitiative')
      .addItem('Roll Selected with Karma', 'rollSelectedWithKarma')
      //.addItem('Roll Selected Weapon', 'ED4eFunctions.rollSelectedTalent')
      .addSeparator()
      .addItem('Spend a Karma point', 'ED4eFunctions.SpendKarma')
      .addItem('Buy a Karma point', 'ED4eFunctions.AddKarma')
      .addItem('Add Legend', 'ED4eFunctions.AddLegend')
      .addSeparator()
      .addItem('Cause Damage', 'ED4eFunctions.causeDmg')
      .addItem('Heal Damage', 'ED4eFunctions.healDmg')
      .addItem('Heal Wound', 'ED4eFunctions.removeWound')
      .addSeparator()
      .addItem('Drink Booster potion','ED4eFunctions.boosterPotion')
      .addItem('Drink Healing potion','ED4eFunctions.healingPotion')
      //.addSeparator()
      //.addItem('Toggle Potential to Dagger', 'checkItemPotentialFlag')
      //.addSubMenu(ui.createMenu('Sub-menu')
      //    .addItem('Second item', 'menuItem2'))
      .addToUi();

}

function simpleAction(action,target,characteristic) {
  try {
    action.target = target;
    action.characteristic = characteristic;
    action.initialize();
    ED4eActions.simpleAction(action);
  }
  finally {
    action.commit();
  }
}

function diceAction(action,target,characteristic) {
  try {
    action.target = target;
    action.characteristic = characteristic;
    action.initialize();
    ED4eActions.diceAction(action);
  }
  finally {
    action.commit();
  }
}

function newDay() {
  var action = ED4eActions.EDAction(CharacterSheetLocations);
  simpleAction(action,"Environment","New Day");
}

function healWound() {
  var action = ED4eActions.EDAction(CharacterSheetLocations);
  simpleAction(action,"Health","Wounds");
}

function decreaseDamage() {
  var action = ED4eActions.EDAction(CharacterSheetLocations);
  simpleAction(action,"Health","Heal");
}

function increaseDamage() {
  var action = ED4eActions.EDAction(CharacterSheetLocations);
  simpleAction(action,"Health","Damage");
}

function karmaRitual() {
  var action = ED4eActions.EDAction(CharacterSheetLocations);
  simpleAction(action,"Talent","Karma Ritual");
}

function rollKnockdown() {
  var action = ED4eActions.EDAction(CharacterSheetLocations);
  diceAction(action,"Health","Knockdown");  
}

function rollRecoveryTest() {
  var action = ED4eActions.EDAction(CharacterSheetLocations);
  diceAction(action,"Health","Recovery");  
}

function rollDamage() {
  var action = ED4eActions.EDAction(CharacterSheetLocations);
  diceAction(action,action.value(CharacterSheetLocations.WeaponName),"Damage");
}

function rollAttack() {
  var action = ED4eActions.EDAction(CharacterSheetLocations);
  diceAction(action,action.value(CharacterSheetLocations.WeaponName),"Attack");
}

function rollTalent() {
  var action = ED4eActions.EDAction(CharacterSheetLocations);
  var characteristic = action.value(CharacterSheetLocations.TalentName);
  var target = action.property("Talent",characteristic,"Type");
  if (action.property(target,characteristic,"Step") == null) {
    simpleAction(action,target,characteristic);
  }
  else {
    diceAction(action,target,characteristic);
  }
}

function rollInitiative(){
  var action = ED4eActions.EDAction(CharacterSheetLocations);
  diceAction(action,"Attribute","Initiative");
}

function rollKarma(){
  var action = ED4eActions.EDAction(CharacterSheetLocations);
  diceAction(action,"Character","Karma");
}



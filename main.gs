var action = ED4eActions.EDAction( ).initialize();

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
    ED4eActions.diceAction(action);
  }
  finally {
    action.commit();
  }
}

function newDay() {

  simpleAction(action,"Environment","New Day");
}

function healWound() {

  simpleAction(action,"Health","Wounds");
}

function decreaseDamage() {

  simpleAction(action,"Health","Heal");
}

function increaseDamage() {

  simpleAction(action,"Health","Damage");
}

function karmaRitual() {

  simpleAction(action,"Talent","Karma Ritual");
}

function rollKnockdown() {

  diceAction(action,"Health","Knockdown");  
}

function rollRecoveryTest() {

  diceAction(action,"Health","Recovery");  
}

function rollDamage() {

  diceAction(action,action.propertyValue("Action","Weapon","Selected"),"Damage");
}

function rollAttack() {

  diceAction(action,action.propertyValue("Action","Weapon","Selected"),"Attack");
}

function rollAttribute() {
  diceAction(action,"Attribute",action.propertyValue("Action","Attribute","Selected"));
}

function rollTalent() {

  var characteristic = action.propertyValue("Action","Talent","Selected");
  var target = action.propertyValue("Talent",characteristic,"Selected");
  if (action.propertyValue(target,characteristic,"Step") == null) {
    simpleAction(action,target,characteristic);
  }
  else {
    diceAction(action,target,characteristic);
  }
}

function rollInitiative(){

  diceAction(action,"Attribute","Initiative");
}

function rollKarma(){

  diceAction(action,"Character","Karma");
}



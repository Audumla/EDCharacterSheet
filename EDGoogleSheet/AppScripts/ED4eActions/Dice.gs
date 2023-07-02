var stepDice = null;
var stepIndex = null;

function getStepDice(step=0) {
   if (stepDice == null) {
      stepDice = SpreadsheetApp.getActiveSpreadsheet().getRange("StepDice").getValues();
      stepIndex = stepDice.map(x => x[0]);
  }
    
  var index = stepIndex.indexOf(step);
  if (index == -1) {
    return null;
  } else {
    var foundValue = stepDice[index][1];
    return foundValue; 
  } 
}


function rollDice(action, step, modifier = 0, karmaStep = 0) {

  var allResults = new Array(0,1,2,3,4);
  var die=getStepDice(step);
  //first work out if there is one die or more
  var totalNumOfDice = 0;  
  var totalResult = 0;

  die = die.split("(")[0];
 
  // Role for each die but first work out each die in the string
  var dices = new Array(totalNumOfDice);
  dices = die.split("+");
  totalNumOfDice = dices.length;
  var dieResults = "";

  for (var i=0; i < totalNumOfDice; i++) {
  
    allResults[i] = roleOnedie(dices[i]);
    totalResult += allResults[i][0];
    dieResults += "You roled a: " + dices[i] + " getting: " + allResults[i][1] + "\n";
  }

  // roll karma if its supplied
  if (karmaStep != 0) {
    var karmaDie = getStepDice(karmsaStep);
    var karmaAllResult = roleOnedie(karmaDie);
    totalResult += Number(karmaAllResult[0])
    action.setProperty("Character","Karma","Result",karmaAllResult[0]);
  }
  else {
    action.setProperty("Character","Karma","Result",null);
  }

  if (modifier !=0) {
    totalResult = totalResult + Number(modifier)
    dieResults += "and Modifier = "+modifier+"\n";
  }

  action.message += dieResults;
  return totalResult;
}

function roleOnedie(diceDescription,reRoll = true) {
  var splitdieText = diceDescription.split("D");
  var numOfdieToRoll = Number(splitdieText[0]);
  // what dice to roll
  var dieType = splitdieText[1];
  var result = "";

  //because the standard notation for 1 die is D not 1D
  if (numOfdieToRoll == 0) {
    numOfdieToRoll = 1;
  }
  
  //roll the number of die
  var roles = new Array(numOfdieToRoll); 
  for(var f = 1;f <= numOfdieToRoll;f++){
    
    roles[f-1] = randomInteger(1,dieType);
    //if any of the roles match the max of the dieType, roll another
    if (roles[f-1]==Number(dieType) && reRoll) {
      numOfdieToRoll = numOfdieToRoll +1;
    }
    result = roles.reduce((a, b) => a + b, 0);
  }
  return [result, roles];
}

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

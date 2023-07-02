const DISABLETRIGGER = "DISABLE";
const ACTIONOPERATION = "ACTION"
const ACTIONLOG = "ACTION";

function disableTrigger(action,operation) {
  if (isNaN(operation)) {
    var breakValues = operation.match(DISABLETRIGGER+":(.*)");
    if (breakValues != undefined) {
      if(breakValues[1] != null) {
         return breakValues[1];
      }
    }
  }
  return null;
}

function evaluateValue(action,operation) {
  var result;
  var value = Number(operation);
  if (isNaN(value)) {
    // parse the operation and evaluate all the sub operations
    value = operation;
//    action.alert(value);
    var params = value.match("(MULTIPLY|ADD|MINUS|DIVIDE|REF|MAX|MIN)[\(|:](?:(?:([^,]*),(.*)[\)])|(.*))");
//    action.alert(params[1]+"\n"+params[2]+"\n"+params[3]+"\n"+params[4]);
    var op = params[1];
    switch (op) {
        case "REF" : 	
          result = params[4].split("|");
          result.push(action.property(result[0],result[1],result[2]));
          break;
        default :
          var arg1 = evaluateValue(action,params[2]);
          var arg2 = evaluateValue(action,params[3]);
          result = arg1[0] != null ? arg1 : arg2;
          switch (op) {
              case "ADD" :  
                result[3] = Number(arg1[3])+Number(arg2[3]);
                break;
              case "MINUS" : 
                result[3] = Number(arg1[3])-Number(arg2[3]);
                break;
              case "DIVIDE" : 
                result[3] = Math.floor(Number(arg1[3])/Number(arg2[3]));
                break;
              case "MULTIPLY" : 
                result[3] = Number(arg1[3])*Number(arg2[3]);
                break;
              case "MAX" :
                result[3] = Math.max(Number(arg1[3]),Number(arg2[3]));
                break;
              case "MIN" : 
                result[3] = Math.min(Number(arg1[3]),Number(arg2[3]));
                break;
              default :
                result = [null,null,null,"ERROR:Unknown trigger operation ["+op+"]"];
          }
    }
  }
  else {
    result = [null,null,null,value];
  }
      //action.alert(rp[3]);
  return result;
}

function applyTriggers(action) {

    // get the 'trigger' properties for this action and add these to the associated property for processing on the commit
    var triggers = action.properties(action.target,action.characteristic,action.actionType);
    //action.alert(action.target+" "+action.characteristic);
    for (var i = 0;i<triggers.length;++i) {
      //action.alert(triggers[i][0]+" "+triggers[i][1]+" "+triggers[i][2]+" "+triggers[i][3]);
      // replace any RESULT strings with the rolled result number
      var result = action.property(action.target,action.characteristic,"Result");
      
      var operation = result == null ? triggers[i][3] : triggers[i][3].replace("RESULT",result);
      var disable = disableTrigger(action,operation);
      if (disable != null) {
        // if any of the triggers are disable then halt the action processing 
        action.error(DISABLETRIGGER,disable);
        action.success = false;
      }
      else {
        // store operations to be executed upon commit
        action.addOperation(operation);
      }
    }
    return action.success;
}

function simpleAction(action) {
  return applyTriggers(action);
}


function diceAction(action){
    // initialize required properties
    var resultNumber = action.locations.ResultLocation != null ? action.value(action.locations.ResultLocation) : null;
    var targetNumber = action.locations.TargetLocation != null ? action.value(action.locations.TargetLocation) : null;
    var stepNumber = action.property(action.target,action.characteristic,"Step");
    var useKarma = action.property(action.target,action.characteristic,"UseKarma"); 
    var rollModifier = action.property(action.target,action.characteristic,"Modifier");
    var karmaStep = action.property("Character","Karma","Step");
    var strain = action.property(action.target,action.characteristic,"Strain");
    var recoveries = action.property(action.target,action.characteristic,"Recoveries");

    // check validity of required properties
    if (rollModifier==null) rollModifier = 0;
    if (useKarma==null) useKarma = 0;
    if (strain==null) strain = 0;
    if (recoveries==null) recoveries = 0;

    // if a result number has not be preset then roll dice
    if ((resultNumber==null) || (resultNumber == 0)) {
      resultNumber = rollDice(action,stepNumber,rollModifier, useKarma ? karmaStep:0);
    }
    action.updateProperty(action.target,action.characteristic,"Result",resultNumber);

    if (applyTriggers(action)) {
      // if a target number has not be preset then get the default target property 
      if (targetNumber == null || targetNumber == 0) {
        //needs to be updated to obtain the default property name and retrieve the value 
        targetNumber = action.property(action.target,action.characteristic,"Target");
      }
      // blank out any prerolled locations if available
      if (action.locations.ResultLocation != undefined) {action.update(action.locations.ResultLocation,"");};
      if (action.locations.TargetLocation != undefined) {action.update(action.locations.TargetLocation,"");};

      // update the target and result for the target property
      if (targetNumber != null) {action.setProperty(action.target,action.characteristic,"Target",targetNumber);}
      action.log(ACTIONLOG,"Rolled "+resultNumber+" for "+action.target+" "+action.characteristic+(targetNumber == null ? "" : " against Target "+targetNumber));
    }
    return action;
}


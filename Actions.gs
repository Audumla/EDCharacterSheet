const DISABLETRIGGER = "DISABLE";
const ACTIONOPERATION = "ACTION"
const ACTIONLOG = "ACTION";
const DEUBGLOG = "DEBUG";
const ERRORLOG = "ERROR";



function EDAction(sheetLocations) {
  return {
    ss : SpreadsheetApp.getActiveSpreadsheet(),
    ui : SpreadsheetApp.getUi(),
    locations : sheetLocations,
    actionProperties : ActionProperties,
    characterProperties : SpreadsheetApp.getActiveSpreadsheet().getRange(sheetLocations.SeedProperties),
    characterPropertiesIndex : sheetLocations.SeedPropertiesIndex == null ? null : SpreadsheetApp.getActiveSpreadsheet().getRange(sheetLocations.SeedPropertiesIndex).getValues().map(x => x[0]),
    propertyResults : SpreadsheetApp.getActiveSpreadsheet().getRange(sheetLocations.ActionPropertyResults),
    actionLog : SpreadsheetApp.getActiveSpreadsheet().getRange(sheetLocations.ActionLog),
    updatedProperties : [],
    operations : [],
    updateData : [],
    target : null,
    characteristic : null,
    messageLog : [],
    success : true,
    actionType : "Trigger",
    updatedRows : [],
    debug : false,

    log : function(type, message) {
      if ((type == DEUBGLOG && this.debug) || (type != DEUBGLOG)) {
        this.messageLog.unshift([this.target,this.characteristic,type,message,""]);
      }
    },

    alert : function(text, buttons = null) {
      this.ui.alert("Message",text,buttons == null ? this.ui.ButtonSet.OK : buttons);
    },

    updateLogs : function(logs) {
        if (logs.length>0) {
            var actionLogs = this.actionProperties.actionValues.actionLog;
            logs = [...logs, ...actionLogs];
            logs = logs.splice(0,actionLogs.length-1);
            this.updateRange(this.actionProperties.actionLocations.actionLog,logs);
        }
    },

    initialize : function() {
      var getData = {
        majorDimension : 'ROWS',
        ranges : []
      };
      const entries = Object.entries(this.actionProperties.actionLocations);
      for (const [key, value] of entries) {
        if (value != null) {
          getData.ranges.push(value);
        }
      }
      var retrievedData = Sheets.Spreadsheets.Values.batchGet(this.ss.getId(),getData);
      var valueindex = 0;
      for (const [key, value] of entries) {
        if (value != null) {
          this.log(DEUBGLOG,"LOADED ["+key+":"+retrievedData.valueRanges[valueindex].range+"]");
          this.actionProperties.actionValues[key] = retrievedData.valueRanges[valueindex].values == undefined ? null : retrievedData.valueRanges[valueindex].values;
          valueindex++;
        }
      }
    },

    commit : function() {
      try {
        if (this.success) {
            // execute any operations that have been collected over the action execution
            for (var i=0;i<this.operations.length;++i) {
              var newValue = evaluateValue(this,this.operations[i]);
              this.log(DEUBGLOG,"EXECUTE["+this.operations[i] +"] UPDATE["+newValue+"]");
              this.updateProperty(newValue[0],newValue[1],newValue[2],newValue[3]);
            }

            // build the commit structure from properties that have been updated
            for (var i=0;i<this.updatedProperties.length;++i) {
              var newValue = this.updatedProperties[i];
              this.setProperty(newValue[0],newValue[1],newValue[2],newValue[3]);
            }
          }
      } finally {
        // write logs
        this.updateLogs(this.messageLog);
        // commit all the updates 
        if (this.updateData.length > 0) {
          var resource = {
            valueInputOption: 'USER_ENTERED',
            data: this.updateData,
          }
          Sheets.Spreadsheets.Values.batchUpdate(resource,this.ss.getId());
        }
      }
    },

    updateProperty : function(target,characteristic,property,value) {
        var updatedProperty = this.findUpdatedProperty(target,characteristic,property);
        if ( updatedProperty == null ) {
           this.updatedProperties.push([target,characteristic,property,value]);
        }
        else {
           updatedProperty[3] = value;
        }
    },

    findUpdatedProperty : function(target,characteristic,property,value=null) {
      for (var index = 0;index<this.updatedProperties.length;++index) {
        if ( (target == null ? true : this.updatedProperties[index][0]==target) && (characteristic == null ? true : this.updatedProperties[index][1]==characteristic) && (property == null ? true : this.updatedProperties[index][2]==property) && (value == null ? true : this.updatedProperties[index][3]==value)) {
          return this.updatedProperties[index];
        }
      }
      return null;
    },

    getCharacterPropertiesIndex : function() {
        if (this.characterPropertiesIndex == null) {
          this.characterPropertiesIndex = this.characterProperties.getValues().map(x => x[0]+x[1]+x[2])
        }
        return this.characterPropertiesIndex;
    },

    property : function(target,characteristic,property) {
        var updatedProperty = this.findUpdatedProperty(target,characteristic,property);
        if (updatedProperty == null) {
          var vals = this.characterProperties.getValues();
          var index = this.getCharacterPropertiesIndex().indexOf(target+characteristic+property);
          if (index >= 0) {
            updatedProperty= vals[index][3];
          }
          /*
          for (var index = 0;index<vals.length;++index) {
            if (vals[index][0]==target && vals[index][1]==characteristic && vals[index][2]==property) {
              // if the value has been referenced then put it in the cache of values to allow the property to be updated during commit  
              updatedProperty= vals[index][3];
              break
            }
          }*/
        }
        else {
          updatedProperty = updatedProperty[3];
        }
        return updatedProperty;
    },

    properties : function(target,characteristic,property) {
        var vals = this.characterProperties.getValues();
        var found = [];
        var key = target+characteristic+property;
        var map = this.getCharacterPropertiesIndex();
        for (var index = 0;index<map.length;++index) {
          if (map[index]==key) {
            found.push(vals[index]);
          }
        }
        return found;
    },

    range : function(rangeName) {
      return this.ss.getRangeByName(rangeName);
    },

    value : function(valueName) {
      return this.ss.getRangeByName(valueName).getValue();
    },

    update : function(target,values) {
        this.updateRange(target,[[values]]);
    },

    updateRange : function(target,values) {
        this.updateData.push({
            range: target,
            values: values
        })
    },

    addOperation : function(operation) {
      this.operations.push(operation);
    },


    setProperty : function(target,characteristic,property,value) {
      var v = this.propertyResults.getValues();
      var count = 0;
      var index = -1;
      while (count < v.length) {
        if (v[count] && v[count][0].toString().length > 0) {
          if (v[count][0]==target && v[count][1]==characteristic && v[count][2]==property) {
            index = count;
            break;
          }
          else {
            ++count;
          }
        } else {
          if ((index < 0 ) && (this.updatedRows.indexOf(count)<0)) {
            index = count;
          }
          else {
            ++count;
          }
        }
      }
      this.updatedRows.push(index);
      ++index;
      var range = this.propertyResults.getSheet().getName()+"!"+this.propertyResults.getCell(index,1).getA1Notation()+":"+this.propertyResults.getCell(index,4).getA1Notation();
//      this.alert(target+characteristic+property+value+" : "+this.propertyResults.getSheet().getName()+"!"+this.propertyResults.getCell(index,1).getA1Notation()+":"+this.propertyResults.getCell(index,4).getA1Notation());
      this.updateRange(range,value == null ? [[null,null,null,0]] : [[target,characteristic,property,value]]);
    }
  }
}
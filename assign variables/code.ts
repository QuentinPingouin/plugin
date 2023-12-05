figma.parameters.on('input', ({query, result, key, parameters}) =>{  
  const getNumberVariable = figma.variables.getLocalVariables('FLOAT'),
        getColorVariable = figma.variables.getLocalVariables('COLOR'),
        getTextVariable = figma.variables.getLocalVariables('STRING');
  
  let colorNames: string[] = [];
  let colorObjects: any[] = [];
  let floatObjects: any[] = [];
  const emptySuggestionArray: string[] = ["You need variable to use this plugin"],
        emptyFloatSuggestionArray: string[] = ["You need number variable to use this"],
        emptyColorSuggestionArray: string[] = ["You need color variable to use this"];
  
  let importedColorVariable: any[] = [],
      importedFloatVariable: any[] = [],
      importedTextVariable: any[] = [],
      importedCollection: any[] = [];
      
  async function getLibraryCollections() {
    const libraryCollections =
      await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
    for (const libraryItem of libraryCollections) {
      let variablesInLibrary = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(libraryItem.key);
      importedCollection.push(libraryItem);

      for(const variable of variablesInLibrary){
        const importedVariable =
          await figma.variables.importVariableByKeyAsync(variable.key);

        switch(importedVariable.resolvedType){
          case 'COLOR':           
            importedColorVariable.push(importedVariable);
          break;

          case 'FLOAT':
            importedFloatVariable.push(importedVariable);
          break;

          case 'STRING':    
            importedTextVariable.push(importedVariable);            
          break;
        }
      }
    }
  }
  
  // if(figma.variables.getLocalVariables().length === 0){    
  //   result.setSuggestions(emptySuggestionArray);
  // } else {
    switch(key){
      case 'color':
      case 'border_color':

      getColorVariable.forEach(color => {
        const colorCollectionId = color.variableCollectionId,
              colorCollectionName = figma.variables.getVariableCollectionById(colorCollectionId)?.name,
              colorName = color.name,
              colorVariableId = color.id,
              // colorValue = color.valuesByMode,
              // colorFirstValue = colorValue[Object.keys(colorValue)[0]] as RGBA,
              colorHexValue = rgbaToHex(color.valuesByMode[Object.keys(color.valuesByMode)[0]] as RGBA);

              colorObjects.push({
                name: colorName,
                // rgbaValue: colorFirstValue,
                hexValue: colorHexValue,
                id: colorVariableId,
                collectionName: colorCollectionName,
                collectionId: colorCollectionId,
                location: 'Local',
                searchValue: colorName + ' (' + colorCollectionName + ')' 
              })        
      });
      
        // if(figma.variables.getLocalVariables('COLOR').length === 0){
        //   result.setSuggestions(emptyColorSuggestionArray);
        // } else {
          // let colorNames: string[] = [];


          getLibraryCollections().then(() => {
            importedColorVariable.forEach(importedColor => {
              const colorCollectionId = importedColor.variableCollectionId,
                colorCollectionNameImported = figma.variables.getVariableCollectionById(colorCollectionId)?.name,
                colorNameImported = importedColor.name,
                colorVariableIdImported = importedColor.id,
                // colorValueImported = importedColor.valuesByMode,
                // colorFirstValueImported = colorValueImported[Object.keys(colorValueImported)[0]] as RGBA,
                colorHexValueImported = rgbaToHex(importedColor.valuesByMode[Object.keys(importedColor.valuesByMode)[0]] as RGBA);

              colorObjects.push({
                name: colorNameImported,
                // rgbaValue: colorFirstValueImported,
                hexValue: colorHexValueImported,
                id: colorVariableIdImported,
                collectionName: colorCollectionNameImported,
                collectionId: colorCollectionId,
                location: 'Imported',
                searchValue: colorNameImported + ' (' + colorCollectionNameImported + ')' 
              })  
              
            });     
            const suggestionsColor = colorObjects
              .filter(s => s.searchValue.includes(query))
              .map((s, index) => {
                const currentColor = colorObjects[index]
                return ({ 
                  name: s.searchValue,
                  icon: `<svg width="$size$" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="${currentColor.hexValue}" /></svg>`,
                  data: {
                    variableID: currentColor.id,
                    collectionId: currentColor.collectionId,
                    localOrImported: currentColor.location,
                  }})
              });
              
          result.setSuggestions(suggestionsColor);     
          });
        // }
      break;

      case 'border_width':
        getNumberVariable.forEach(float => {
          const floatCollectionId = float.variableCollectionId,
                floatCollectionName = figma.variables.getVariableCollectionById(floatCollectionId)?.name,
                floatName = float.name,
                floatVariableId = float.id,
                floatValue = float.valuesByMode[Object.keys(float.valuesByMode)[0]] as number;
  
            floatObjects.push({
              name: floatName,
              value: floatValue,
              id: floatVariableId,
              collectionName: floatCollectionName,
              collectionId: floatCollectionId,
              location: 'Local',
              searchValue: floatValue + 'px (' + floatName + ' - ' + floatCollectionName + ')' 
            })        
        });

        getLibraryCollections().then(() => {
          importedFloatVariable.forEach(importedFloat => {
            const floatCollectionId = importedFloat.variableCollectionId,
                  floatCollectionNameImported = figma.variables.getVariableCollectionById(floatCollectionId)?.name,
                  floatNameImported = importedFloat.name,
                  floatVariableIdImported = importedFloat.id,
                  floatValueImported = importedFloat.valuesByMode[Object.keys(importedFloat.valuesByMode)[0]] as number;

            floatObjects.push({
              name: floatNameImported,
              value: floatValueImported,
              id: floatVariableIdImported,
              collectionName: floatCollectionNameImported,
              collectionId: floatCollectionId,
              location: 'Imported',
              searchValue: floatValueImported + 'px (' + floatNameImported + ' - ' + floatCollectionNameImported + ')' 
            })  
            
          });

          if(floatObjects.length == 0){
            for(let numberCount = 0; numberCount <= 10; numberCount++){              
              floatObjects.push({
                name: '', 
                value: numberCount, 
                id: 'created/' + numberCount,
                collectionId: 'createdCollection/' + numberCount,
                location: 'created',
                searchValue: numberCount + 'px',
              })              
            }
          } else {
            floatObjects.sort((a, b) => a.value - b.value);
          }
          
          const suggestionsFloat = floatObjects
            .filter(s => s.searchValue.includes(query))
            .map((s) => {              
              const sizeFixe = 16;  
              return ({ 
                name: s.searchValue,
                icon: `<svg width="${sizeFixe}" height="${sizeFixe}" viewBox="0 0 ${sizeFixe} ${sizeFixe}" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="${sizeFixe}" height="${sizeFixe}" fill="#ffffff" stroke="red" stroke-width="${s.value}"/></svg>`,
                data: {
                  value : s.value,
                  variableID: s.id,
                  collectionId: s.collectionId,
                  localOrImported: s.location,
                }})
            });
          result.setSuggestions(suggestionsFloat);  
        });
      break;

      case 'height':
      case 'width':
      case 'itemSpacing':
      case 'radius':
      case 'characters':
      case 'padding':
      case 'minWidth':
      case 'maxWidth':
      case 'minHeight':
      case 'maxHeight':
        let numberVariable = figma.variables.getLocalVariables('FLOAT'),
            scopesCases: string[] = ['ALL_SCOPES', 'TEXT_CONTENT', 'CORNER_RADIUS', 'WIDTH_HEIGHT', 'GAP'],
            sizeArray: string[] = [],
            scopeType = 'ALL_SCOPES',
            scopeArray: string[] = [];

        if(figma.variables.getLocalVariables('FLOAT').length === 0){
          result.setSuggestions(emptyFloatSuggestionArray);
        } else {
          numberVariable.forEach(element => {
            if(element){
              const scopeTypeActualy = element.scopes.toString();
              scopeArray.push(scopeTypeActualy)
            }
          });

          switch(key){
            case 'height':
            case 'width':
              scopeType = "WIDTH_HEIGHT";
            break;
  
            case 'itemSpacing':
              scopeType = 'GAP';
            break;
  
            case 'radius':
              scopeType = 'CORNER_RADIUS';
            break;
  
            case 'characters':
              scopeType = 'TEXT_CONTENT';
            break;
              
            default:
              scopeType = 'ALL_SCOPES';
            break;
          }

          let conditionalSize = scopeArray.toString().includes(scopeType);
          if(conditionalSize) {
            numberVariable.forEach(element => {
              if(element){
                writeVariables(element, scopeType, sizeArray);
              }
            });
          } else {      
            numberVariable.forEach(element => {
              if(element){
                writeVariables(element, 'ALL_SCOPES', sizeArray, false);
              }
            });
          }
          result.setSuggestions(sizeArray.filter(s => s.includes(query)))
        }
      break;

      case 'paddingSize':
        if(figma.variables.getLocalVariables('FLOAT').length === 0){
          result.setSuggestions(emptyFloatSuggestionArray);
        } else {
          let numberVariablePadding = figma.variables.getLocalVariables('FLOAT'),
              paddingSizeArray: string[] = [];
          numberVariablePadding.forEach(element => {
            let firstModeValue = element.valuesByMode[Object.keys(element.valuesByMode)[0]] as Number;
            let collectionId = element.variableCollectionId;          
            let getCollectionPadding = figma.variables.getVariableCollectionById(collectionId);

            if(getCollectionPadding){
              let collectionName = getCollectionPadding.name;
              paddingSizeArray.push(firstModeValue + 'px (' + element.name + ' - ' + collectionName + ')' );
            }
          });
          result.setSuggestions(paddingSizeArray.filter(s => s.includes(query)))
        }
      break;

      case 'paddingPosition':
        let paddingPositionArray: string[] = ['Top & bottom', 'Left & Right', 'Top', 'Bottom', 'Left', 'Right'];
        const suggestionsPaddingPosition = paddingPositionArray
            .filter(s => s.includes(query))
            .map((s) => {
              const sizeFixe = 16,
                    littleSize = 4,
                    bigSize = 14,
                    littlePosition = 1,
                    bigPosition = 11;
              let paddingWidth = bigSize,
                  paddingHeight = littleSize,
                  paddingPositionX = littlePosition,
                  paddingPositionY = littlePosition,
                  paddingWidthSecond = bigSize,
                  paddingHeightSecond = littleSize,
                  paddingPositionXSecond = littlePosition,
                  paddingPositionYSecond = bigPosition,
                  visibilitySecond = "hidden";

                  switch(s){
                    case 'Bottom':
                      paddingPositionY = bigPosition;
                    break;
                    case 'Top & bottom':
                      visibilitySecond = "visible";
                    break;
                    case 'Left':
                      paddingWidth = littleSize;
                      paddingHeight = bigSize;
                    break;
                    case 'Right':
                      paddingWidth = littleSize;
                      paddingHeight = bigSize;
                      paddingPositionX = bigPosition;
                    break;
                    case 'Left & Right':
                      paddingWidth = littleSize;
                      paddingHeight = bigSize;
                      paddingWidthSecond = littleSize;
                      paddingHeightSecond = bigSize;
                      paddingPositionXSecond = bigPosition;
                      paddingPositionYSecond = littlePosition;
                      visibilitySecond = "visible";
                    break;
                  }
                  
                  return ({ name: s, icon: `<svg width="${sizeFixe}" height="${sizeFixe}" viewBox="0 0 ${sizeFixe} ${sizeFixe}" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="${sizeFixe}" height="${sizeFixe}" fill="#ffffff" x="0" y="0"/><rect width="${paddingWidth}" height="${paddingHeight}" x="${paddingPositionX}" y="${paddingPositionY}" rx="1" fill="#0D99FF"/><rect width="${paddingWidthSecond}" height="${paddingHeightSecond}" x="${paddingPositionXSecond}" y="${paddingPositionYSecond}" visibility="${visibilitySecond}" rx="1" fill="#0D99FF"/></svg>`});
              });
            
        result.setSuggestions(suggestionsPaddingPosition);
      break;

      case 'radiusPosition':
        let radiusPositionArray: string[] = ['Top', 'Top left', 'Top right', 'Bottom', 'Bottom left', 'Bottom right', 'Left', 'Right'];
        const suggestionsRadius = radiusPositionArray
            .filter(s => s.includes(query))
            .map((s) => {
              let sizeFixe = 16,
                  radiusSize = 6,
                  xPosition = 0,
                  yPosition = 0,
                  heightSize = 26,
                  widthSize = 26;

              switch(s){
                case 'Top':                
                  widthSize = 16;
                break;
                case 'Top right':
                  xPosition = -10;
                break;
                case 'Bottom':
                  yPosition = -10;
                  widthSize = 16;
                break;
                case 'Bottom left':
                  yPosition = -10;
                break;
                case 'Bottom right':
                  yPosition = -10;
                  xPosition = -10;
                break;
                case 'Right':
                  xPosition = -10;
                  heightSize = 16;
                break;
                case 'Left':
                  heightSize = 16;
                break;
              }

              return ({ name: s, icon: `<svg width="${sizeFixe}" height="${sizeFixe}" viewBox="0 0 ${sizeFixe} ${sizeFixe}" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="${widthSize}" height="${heightSize}" fill="#ffffff"  rx="${radiusSize}" x="${xPosition}" y="${yPosition}"/></svg>`});
            });
            
        result.setSuggestions(suggestionsRadius);
      break;
      case 'gap_size':
        if(figma.variables.getLocalVariables('FLOAT').length === 0){
          result.setSuggestions(emptyFloatSuggestionArray);
        } else {
          let gapNumberVariables = figma.variables.getLocalVariables('FLOAT');
          let gapCount = 0;
          let gapSizeArray: string[] = [];

          gapNumberVariables.forEach(numberVariable => {
            if(numberVariable.scopes.toString().includes('GAP')){    
              let gapValues = numberVariable.valuesByMode[Object.keys(numberVariable.valuesByMode)[0]].toString();
              let gapCollectionId = numberVariable.variableCollectionId;
              let gapCollectionName = figma.variables.getVariableCollectionById(gapCollectionId)?.name;
                
              gapSizeArray.push(gapValues + 'px (' + numberVariable.name + ' - ' + gapCollectionName + ')');
              gapCount++;
            }
          });

          if(gapCount == 0) {
            gapNumberVariables.forEach(numberVariable => {
              let gapValues = numberVariable.valuesByMode[Object.keys(numberVariable.valuesByMode)[0]].toString();
              let gapCollectionId = numberVariable.variableCollectionId;
              let gapCollectionName = figma.variables.getVariableCollectionById(gapCollectionId)?.name;

              gapSizeArray.push(gapValues + 'px (' + numberVariable.name + ' - ' + gapCollectionName + ')');
            });        
          }
          result.setSuggestions(gapSizeArray);
        }
      break;
      case 'character':
        let textArray: string[] = [], 
            myTextVariables = figma.variables.getLocalVariables('STRING');

        myTextVariables.forEach(textVariable => {
          let textValue = textVariable.valuesByMode[Object.keys(textVariable.valuesByMode)[0].toString()] as string,
              textCollectionId = textVariable.variableCollectionId,
              textCollectionName = figma.variables.getVariableCollectionById(textCollectionId);
          
          textArray.push(textValue + ' (' + textVariable.name + ' - ' + textCollectionName?.name + ')')
        });
        result.setSuggestions(textArray);
      break;
    }
  // }
})

figma.on('run', ({ command, parameters }: RunEvent) => {
  if(parameters){    
    let myNumberVariables = figma.variables.getLocalVariables('FLOAT'),
        myColorVariables = figma.variables.getLocalVariables('COLOR'),
        myStringVariables = figma.variables.getLocalVariables('STRING'),
        mySelection = figma.currentPage.selection,
        key = parameters[command];

    switch(command) {
      case 'color':
        let selectedVariable = figma.variables.getVariableById(key.variableID);
        if(mySelection.length > 0){          
          mySelection.forEach(selectedObject => {
            if ('fills' in selectedObject && selectedVariable) {
              if(selectedObject.fills.toLocaleString() === ""){
                selectedObject.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
              }
              const fillsCopy = clone(selectedObject.fills);
              fillsCopy[0] = figma.variables.setBoundVariableForPaint(fillsCopy[0], 'color', selectedVariable)
              selectedObject.fills = fillsCopy
            }
          });
        } else {
          figma.notify('Please, select an item')
        }        
      break;

      case 'border':
        let borderColorID = parameters['border_color']?.variableID,
            currentColorVariable = figma.variables.getVariableById(borderColorID);

        if(mySelection.length > 0){
          mySelection.forEach(selectedObject => {
            if('strokes' in selectedObject && currentColorVariable){
              if(selectedObject.strokes.toString() === ''){
                selectedObject.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
              }
              const strokesCopy = clone(selectedObject.strokes);
              strokesCopy[0] = figma.variables.setBoundVariableForPaint(strokesCopy[0], 'color', currentColorVariable)
              selectedObject.strokes = strokesCopy
              if(parameters['border_width'] != undefined){             
                selectedObject.strokeWeight = parameters['border_width'].value;
              }
            }
          });

        } else {
          figma.notify('Please, select an item')
        }
      break;

      case 'height':
      case 'width':
      case 'minWidth':
      case 'maxWidth':
      case 'minHeight':
      case 'maxHeight':
        if(mySelection.length > 0){
          mySelection.forEach(selectedObject => {            
            myNumberVariables.forEach(numberElement => {
              if(key.toLowerCase().includes(numberElement.name.toLowerCase())){
                selectedObject.setBoundVariable(command, numberElement.id);
              }
            });
          });
        } else {
          figma.notify('Please select an item')
        }
      break;

      case 'padding':
        const paddingTypeArray: string[] = ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom'];
        let complexPaddingParametresKey = Object.keys(parameters),
            parametersPaddingLenght = complexPaddingParametresKey.length;                        
        if(mySelection.length > 0){
          mySelection.forEach(selectedObject => {
            if(mySelection[0].type == 'FRAME' && mySelection[0].layoutMode != 'NONE'){
              myNumberVariables.forEach(floatElement => {
                let complexPaddingParametre = parameters[complexPaddingParametresKey[0]].toLowerCase();
                if(complexPaddingParametre.includes(floatElement.name.toLowerCase())){
                  paddingTypeArray.forEach(paddingType => {
                    if(parametersPaddingLenght == 1){
                      if(paddingType == "paddingLeft" || paddingType == "paddingRight" || paddingType == "paddingBottom" || paddingType == "paddingTop"){
                        selectedObject.setBoundVariable(paddingType, floatElement.id);
                      }
                    } else if(parametersPaddingLenght == 2){
                      switch(parameters[complexPaddingParametresKey[1]]){
                        case 'Top & bottom':
                          if(paddingType == "paddingBottom" || paddingType == "paddingTop"){
                            selectedObject.setBoundVariable(paddingType, floatElement.id);
                          }
                        break;
                        case 'Left & Right':
                          if(paddingType == "paddingLeft" || paddingType == "paddingRight"){
                            selectedObject.setBoundVariable(paddingType, floatElement.id);
                          }
                        break;
                        case 'Right':
                            selectedObject.setBoundVariable('paddingRight', floatElement.id);
                        break;
                        case 'Left':
                            selectedObject.setBoundVariable('paddingLeft', floatElement.id);
                        break;
                        case 'Bottom':
                            selectedObject.setBoundVariable('paddingBottom', floatElement.id);
                        break;
                        case 'Top':
                            selectedObject.setBoundVariable('paddingTop', floatElement.id);
                        break;
                      } 
                    }
                  });
                }
              });  
            } else {
              figma.notify("Auto layout required for padding... Sorry")
            }     
          });
        } else {
          figma.notify('Please select an item')
        }
        
      break;

      case 'radius':
        let radiusLoopCount = 0;
        if(figma.currentPage.selection.length > 0){
          mySelection.forEach(selectedObject => {
            if(selectedObject){
              const maSelection: RectangleNode = figma.currentPage.selection[radiusLoopCount] as RectangleNode;
              myNumberVariables.forEach(numberVariable => {
                if(key.toLowerCase().includes(numberVariable.name.toLocaleLowerCase())){
                  const radiusPositionsArray = {
                    'Top': ['topLeftRadius', 'topRightRadius'],
                    'Top left': ['topLeftRadius'],
                    'Top right': ['topRightRadius'],
                    'Bottom': ['bottomLeftRadius', 'bottomRightRadius'],
                    'Bottom left': ['bottomLeftRadius'],
                    'Bottom right': ['bottomRightRadius'],
                    'Left': ['topLeftRadius', 'bottomLeftRadius'],
                    'Right': ['topRightRadius', 'bottomRightRadius'],
                  } as any;

                  switch(parameters.radiusPosition){
                    case 'Top':
                    case 'Top left':
                    case 'Top right':
                    case 'Bottom':
                    case 'Bottom left':
                    case 'Bottom right':
                    case 'Left':
                    case 'Right':
                      let radiusPositionString = parameters.radiusPosition.toString();

                      radiusPositionsArray[radiusPositionString].forEach((position: any) => {
                        maSelection.setBoundVariable(position, numberVariable.id);
                      });
                    break;
  
                    default:
                      maSelection.setBoundVariable('topLeftRadius', numberVariable.id);
                      maSelection.setBoundVariable('topRightRadius', numberVariable.id);
                      maSelection.setBoundVariable('bottomLeftRadius', numberVariable.id);
                      maSelection.setBoundVariable('bottomRightRadius', numberVariable.id);
                    break;
                  }
                }
              });
              radiusLoopCount++;
            }
          });
        } else {
          figma.notify('Please select an item')
        }
      break;
      case 'gap':
        let parameterKey = parameters[Object.keys(parameters).toString()];
        if(mySelection.length > 0){
          mySelection.forEach(selectedObject => {
            if(mySelection[0].type == 'FRAME' && mySelection[0].layoutMode != 'NONE' && 'layoutMode' in selectedObject){
              myNumberVariables.forEach(numberVariables => {
                if(parameterKey.toLowerCase().includes(numberVariables.name.toLowerCase())){
                  selectedObject.setBoundVariable('itemSpacing', numberVariables.id);
                  selectedObject.setBoundVariable('counterAxisSpacing', numberVariables.id);
                }
              });
            }
          });
        } else {
          figma.notify('Please select an item')
        }
      break;
      case 'character':
        if(mySelection.length > 0){
          mySelection.forEach(selectedObject => {
            myStringVariables.forEach(stringVariable => {
              let textValueByMode = stringVariable.valuesByMode[Object.keys(stringVariable.valuesByMode)[0]].toString();
              if(key.toLowerCase().includes(textValueByMode.toLocaleLowerCase())){
                if(selectedObject.type == 'TEXT'){
                  selectedObject.setBoundVariable('characters', stringVariable.id);
                } else {
                  figma.notify('Please select a text layer')
                }
              }
            });
          });
        } else {
          figma.notify('Please select an item')
        }
      break;
    }
  }
  figma.closePlugin()
});

// Functions
function rgbaToHex(color: RGBA): string {
  const r = (Math.round(color.r * 255).toString(16).length === 1 ? '0' : '') + Math.round(color.r * 255).toString(16);
  const g = (Math.round(color.g * 255).toString(16).length === 1 ? '0' : '') + Math.round(color.g * 255).toString(16);
  const b = (Math.round(color.b * 255).toString(16).length === 1 ? '0' : '') + Math.round(color.b * 255).toString(16);
  return `#${r}${g}${b}`;
}

function clone(val: any) {
  return JSON.parse(JSON.stringify(val))
}

function extractNumber(str: any) {
  const matches = str.match(/\d+/);
  return matches ? parseInt(matches[0], 10) : null;
}

function writeVariables(contextualElement: any, numberScoping: string, myArray: any, checkCondition: boolean = true){
  const getNumberCollection = contextualElement.variableCollectionId,
        getNumberCollectionInfo = figma.variables.getVariableCollectionById(getNumberCollection),
        variableValueNumber = contextualElement.valuesByMode[Object.keys(contextualElement.valuesByMode)[0]] as Number;

  if(checkCondition && contextualElement.scopes.toString().includes(numberScoping)){
    myArray.push(variableValueNumber + 'px (' + contextualElement?.name + ' - ' + getNumberCollectionInfo?.name + ')');
  }

  if(!checkCondition){
    myArray.push(variableValueNumber + 'px (' + contextualElement?.name + ' - ' + getNumberCollectionInfo?.name + ')');
  }
}
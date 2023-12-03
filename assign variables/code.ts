figma.parameters.on('input', ({query, result, key, parameters}) =>{  
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
  

  if(figma.variables.getLocalVariables().length === 0){    
    result.setSuggestions(emptySuggestionArray);
  } else {
    switch(key){
      case 'color':
      case 'border_color':
        if(figma.variables.getLocalVariables('COLOR').length === 0){
          result.setSuggestions(emptyColorSuggestionArray);
        } else {
          let colorNames: string[] = [];
          let dataNames: string[] = [];
          
          let getCollection = figma.variables.getLocalVariableCollections();
          let collectionLength = getCollection.length;

          //Collection Loop
          for (let collectionCount = 0; collectionCount < collectionLength; collectionCount++) {
            let collection = getCollection[collectionCount];
            let collectionName = collection.name;
            let collectionVariablesIds = collection.variableIds;
            let collectionVariablesIdsLength = collectionVariablesIds.length;

            //Variables Loop
            for (let variableIdsCount = 0; variableIdsCount < collectionVariablesIdsLength; variableIdsCount++) {
              let variableIdsString = collectionVariablesIds[variableIdsCount];
              let variableObjet = figma.variables.getVariableById(`${variableIdsString}`);
              let getColor = variableObjet?.name.toLocaleLowerCase();
              let getValueMode = variableObjet?.valuesByMode;
              let getResolveType = variableObjet?.resolvedType;

              if(getResolveType == 'COLOR' && getColor !== undefined) {
                //Push the color name to the array
                if(getValueMode){
                  let firstModeValue = getValueMode[Object.keys(getValueMode)[0]] as RGBA;

                  colorNames.push(getColor + ' (' + collectionName + ')');
                  dataNames.push(rgbaToHex(firstModeValue));
                }
              }
            }
          }

          getLibraryCollections().then(() => {
            importedColorVariable.forEach(colorImported => {
              let getImportedColor = colorImported?.name.toLocaleLowerCase();
              let getImportedValueMode = colorImported?.valuesByMode;
              let hexImported = rgbaToHex(getImportedValueMode[Object.keys(getImportedValueMode)[0]]);

              importedCollection.forEach(collectionImported => {
                  if(colorImported.variableCollectionId.includes(collectionImported.key)){
                    colorNames.push(getImportedColor + ' (' + collectionImported.name + ')' + ' <imported/>')
                    dataNames.push(hexImported)
                  }
              });
            });
            const suggestionsColor = colorNames
              .filter(s => s.includes(query))
              .map((s, index) => {
                const myHex = dataNames[index];
                // UTILISER DATA POUR CHOISIR COMMENT APPLIQUER LES VALEURS
                return ({ name: s, icon: `<svg width="$size$" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="${myHex}" /></svg>`})
              });
              
          result.setSuggestions(suggestionsColor);
          });

        }
      break;

      case 'border_width':
        let defaultStrokeSize: string[] = [];
        let getCollectionStroke = figma.variables.getLocalVariableCollections();
        let collectionLengthStroke = getCollectionStroke.length;
        let floatVariableCount = figma.variables.getLocalVariables('FLOAT').length;

        //Collection Loop
        for (let collectionCount = 0; collectionCount < collectionLengthStroke; collectionCount++) {
          let collection = getCollectionStroke[collectionCount];
          let collectionName = collection.name;
          let collectionVariablesIds = collection.variableIds;
          let collectionVariablesIdsLength = collectionVariablesIds.length;

          //Variables Loop
          for (let variableIdsCount = 0; variableIdsCount < collectionVariablesIdsLength; variableIdsCount++) {
            let variableIdsString = collectionVariablesIds[variableIdsCount];
            let variableObjet = figma.variables.getVariableById(`${variableIdsString}`);
            let getColor = variableObjet?.name;
            let getValueMode = variableObjet?.valuesByMode;
            let getResolveType = variableObjet?.resolvedType;

            if(getResolveType == 'FLOAT' && floatVariableCount > 0) {
              if(getValueMode){
                let firstModeValue = getValueMode[Object.keys(getValueMode)[0]] as Number;
                defaultStrokeSize.push(firstModeValue + 'px  (' + collectionName + ')');
              }
            }
          }
        }
        if(floatVariableCount === 0) {
          defaultStrokeSize.push('1', '2', '3', '4', '5', '6', '7', '8', '9', '10');
        }

        const suggestionsNumber = defaultStrokeSize
            .filter(s => s.includes(query))
            .map((s, index) => {
              const variableStringToNumber = extractNumber(defaultStrokeSize[index]) as number; 
              const sizeFixe = 16;          

              return ({ name: s, icon: `<svg width="${sizeFixe}" height="${sizeFixe}" viewBox="0 0 ${sizeFixe} ${sizeFixe}" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="${sizeFixe}" height="${sizeFixe}" fill="#ffffff" stroke="red" stroke-width="${variableStringToNumber}"/></svg>`});
            });
            
        result.setSuggestions(suggestionsNumber);
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
  }
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
        if(mySelection.length > 0){
          mySelection.forEach(selectedObject => {
            myColorVariables.forEach(colorElement => {
              if(key.includes(colorElement.name.toLowerCase())){
                if ('fills' in selectedObject) {
                  if(selectedObject.fills.toLocaleString() === ""){
                    selectedObject.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
                  }
                  const fillsCopy = clone(selectedObject.fills);
                  fillsCopy[0] = figma.variables.setBoundVariableForPaint(fillsCopy[0], 'color', colorElement)
                  selectedObject.fills = fillsCopy
                }
              }
            });          
          });
        } else {
          figma.notify('Please select an item')
        }
        
      break;

      case 'border':
        let complexParametresKey = Object.keys(parameters);           
        if(mySelection.length > 0){
          mySelection.forEach(selectedObject => {
            myColorVariables.forEach(colorElement => {
              let complexParametre = parameters[complexParametresKey[0]].toLowerCase();
              if(complexParametre.includes(colorElement.name.toLowerCase()) && 'strokes' in selectedObject){
                if(selectedObject.strokes.length === 0){                    
                  selectedObject.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
                  selectedObject.strokeWeight = 1;
                }
                const strokesCopy = clone(selectedObject.strokes);
                strokesCopy[0] = figma.variables.setBoundVariableForPaint(strokesCopy[0], 'color', colorElement);
                selectedObject.strokes = strokesCopy;
  
                if(parameters.border_width != undefined){
                  const numberStrokeWidth = extractNumber(parameters.border_width) as number;
                  selectedObject.strokeWeight = numberStrokeWidth;
                }
              }
            });          
          });
        } else {
          figma.notify('Please select an item')
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
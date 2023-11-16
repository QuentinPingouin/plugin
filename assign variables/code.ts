figma.parameters.on('input', ({query, result, key, parameters}) =>{  

  switch(key){
    case 'color':
    case 'border_color':
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
      const suggestionsColor = colorNames
          .filter(s => s.includes(query))
          .map((s, index) => {
            const myHex = dataNames[index];

            return ({ name: s, icon: `<svg width="$size$" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="${myHex}" /></svg>`})
          });
          
      result.setSuggestions(suggestionsColor);
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
    case 'maxheight':
    case 'counterAxisSpacing':
      let numberVariable = figma.variables.getLocalVariables('FLOAT'),
          scopesCases: string[] = ['ALL_SCOPES', 'TEXT_CONTENT', 'CORNER_RADIUS', 'WIDTH_HEIGHT', 'GAP'],
          sizeArray: string[] = [],
          scopeType = 'ALL_SCOPES',
          scopeArray: string[] = [];

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
    break;

    case 'radiusPosition':
      let radiusPositionArray: string[] = ['Top', 'Top left', 'Top right', 'Bottom', 'Bottom left', 'Bottom right', 'Left', 'Right'];
      // result.setSuggestions(radiusPositionArray.filter(s => s.includes(query)))
      const suggestionsRadius = radiusPositionArray
          .filter(s => s.includes(query))
          .map((s, index) => {
            // const variableStringToNumber = radiusPositionArray[index] as string; 
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
  }
})

figma.on('run', ({ command, parameters }: RunEvent) => {
  if(parameters){
    let myNumberVariables = figma.variables.getLocalVariables('FLOAT');
    const commandStringify = command.toString();
    const parameterLowerCase = parameters[command].toLowerCase();

    switch(command) {
      case 'color':
        var variableColors: { [key: string]: any } = figma.variables.getLocalVariables("COLOR"),
            variableColorsLength = variableColors.length;

        for(let colorNumber = 0; colorNumber < variableColorsLength; colorNumber++) {          
          if(parameters[command].toLowerCase().includes(variableColors[colorNumber].name.toLowerCase())) {

            let ChoiceColorId = variableColors[colorNumber];
            const figmaSelection = figma.currentPage.selection;

            for(let mySelectionCount = 0; mySelectionCount < figmaSelection.length; mySelectionCount++){

              const mySelection: RectangleNode = figma.currentPage.selection[mySelectionCount] as RectangleNode;
              
              if(ChoiceColorId){
                if(mySelection.fills.toLocaleString() === ""){
                  mySelection.fills = [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }];
                }
                const fillsCopy = clone(mySelection.fills);

                fillsCopy[0] = figma.variables.setBoundVariableForPaint(fillsCopy[0], 'color', ChoiceColorId)
                mySelection.fills = fillsCopy
              }
            }
          } 
        }
      break;

      //ERREUR ATTENTION
      case 'border':
        var variableColors: { [key: string]: any } = figma.variables.getLocalVariables("COLOR"),
            variableColorsLength = variableColors.length;

        for(let colorNumber = 0; colorNumber < variableColorsLength; colorNumber++) {
          if(parameters[Object.keys(parameters)[0]].toLowerCase().includes(variableColors[colorNumber].name.toLowerCase())) {
    
            let ChoiceColorId = variableColors[colorNumber];
            const figmaSelection = figma.currentPage.selection;
            
            for(let mySelectionCount = 0; mySelectionCount < figmaSelection.length; mySelectionCount++){              
              const mySelection: RectangleNode = figmaSelection[mySelectionCount] as RectangleNode;
              
              if(ChoiceColorId){
                if(mySelection.strokes.length === 0){
                  mySelection.strokes = [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }];
                }
                const strokesCopy = clone(mySelection.strokes);
    
                strokesCopy[0] = figma.variables.setBoundVariableForPaint(strokesCopy[0], 'color', ChoiceColorId)
                mySelection.strokes = strokesCopy;                

                if(parameters.border_width != undefined){
                  const numberStrokeWidth = extractNumber(parameters.border_width) as number;
                  mySelection.strokeWeight = numberStrokeWidth;
                } else {
                  mySelection.strokeWeight = 1;
                }
              
              }
            }
          }
        } 
      break;

      case 'height':
      case 'width':
      case 'itemSpacing':

  // | 'characters'
  // | 'paddingLeft'
  // | 'paddingRight'
  // | 'paddingTop'
  // | 'paddingBottom'
  // | 'visible'
  // | 'minWidth'
  // | 'maxWidth'
  // | 'minHeight'
  // | 'maxHeight'
  // | 'counterAxisSpacing'

  // ATTENTION NE S'APPLIQUE QUE SUR LE PREMIER ELEMENT SELECTIONNE

      // const maSelection: RectangleNode = figma.currentPage.selection[0] as RectangleNode;
      let mySelectionFloatCount = 0;

      figma.currentPage.selection.forEach(element => {
        if(element){
          const maSelection: RectangleNode = figma.currentPage.selection[mySelectionFloatCount] as RectangleNode;

          myNumberVariables.forEach(element => {
            if(parameterLowerCase.includes(element.name)){
              maSelection.setBoundVariable(command, element.id);
            }
          });

          mySelectionFloatCount++;
        }
      });

      

      break;

      // Probleme d'affichage dans l'historique on ne voit pas le nom
      // Ajouter une if non value 0
      case 'radius':
        let radiusLoopCount = 0;
        figma.currentPage.selection.forEach(element => {
          if(element){
            const maSelection: RectangleNode = figma.currentPage.selection[radiusLoopCount] as RectangleNode;
            myNumberVariables.forEach(element => {
              if(parameterLowerCase.includes(element.name)){
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
                      maSelection.setBoundVariable(position, element.id);
                    });
                  break;

                  default:
                    maSelection.setBoundVariable('topLeftRadius', element.id);
                    maSelection.setBoundVariable('topRightRadius', element.id);
                    maSelection.setBoundVariable('bottomLeftRadius', element.id);
                    maSelection.setBoundVariable('bottomRightRadius', element.id);
                  break;
                }
              }
            });
            radiusLoopCount++;
          }
        });
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
figma.parameters.on('input', ({query, result, key, parameters}) =>{  
if(key === 'color' || key === "stroke_color"){
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
    const suggestions = colorNames
        .filter(s => s.includes(query))
        .map((s, index) => {
          const myHex = dataNames[index];

          return ({ name: s, icon: `<svg width="$size$" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="${myHex}" /></svg>`})
        });
         
    result.setSuggestions(suggestions);


  } else if (key === "stroke_width") {
    let defaultStrokeSize: string[] = [];
    let getCollection = figma.variables.getLocalVariableCollections();
    let collectionLength = getCollection.length;
    let floatVariableCount = figma.variables.getLocalVariables('FLOAT').length;

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

    const suggestions = defaultStrokeSize
        .filter(s => s.includes(query))
        .map((s, index) => {
          const variableStringToNumber = extractNumber(defaultStrokeSize[index]) as number; 
          const sizeFixe = 16;          

          return ({ name: s, icon: `<svg width="${sizeFixe}" height="${sizeFixe}" viewBox="0 0 ${sizeFixe} ${sizeFixe}" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="${sizeFixe}" height="${sizeFixe}" fill="#ffffff" stroke="red" stroke-width="${variableStringToNumber}"/></svg>`});
        });
         
    result.setSuggestions(suggestions);
  }
})

figma.on('run', ({ command, parameters }: RunEvent) => {
  if(parameters){
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

      case 'stroke':
        var variableColors: { [key: string]: any } = figma.variables.getLocalVariables("COLOR"),
            variableColorsLength = variableColors.length;
        const figmaSelection = figma.currentPage.selection;

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
                if(parameters.stroke_width != undefined){
                  const numberStrokeWidth = extractNumber(parameters.stroke_width) as number;
                  mySelection.strokeWeight = numberStrokeWidth;
                }
              
              }
            }
          }
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
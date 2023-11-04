let choiceKey: string[] = [];

var variableColors: { [key: string]: any } = figma.variables.getLocalVariables("COLOR"),
    variableColorsLength = variableColors.length;

figma.parameters.on('input', ({ query, result, key, parameters }) => {  


// // Définissez une fonction asynchrone pour votre code
// async function importerVariable() {
//   // Query all published collections from libraries enabled for this file
//   const libraryCollections =
//     await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
  
//   // Select a library variable collection to import into this file
//   const variablesInFirstLibrary =
//     await figma.teamLibrary.getVariablesInLibraryCollectionAsync(libraryCollections[0].key);
    
//   // Import the first number variable we find in that collection
//   const variableToImport =
//     variablesInFirstLibrary.find((libVar) => libVar.resolvedType === 'FLOAT');
//   if(variableToImport != undefined){
//     let importedVariable =
//       await figma.variables.importVariableByKeyAsync(variableToImport.key);
//   }
//   console.log(variablesInFirstLibrary);

// }

// // Appelez la fonction asynchrone
// importerVariable();





  //Get color
  let colorNames: string[] = [];
  let modeNames: string[] = [];
  let modeNamesResult: string[] = [];

  let getCollection = figma.variables.getLocalVariableCollections();
  let collectionLength = getCollection.length;

  //Collection Loop
  for (let collectionCount = 0; collectionCount < collectionLength; collectionCount++) {
    let collection = getCollection[collectionCount];
    let collectionName = collection.name;
    let collectionVariablesIds = collection.variableIds;
    let collectionVariablesIdsLength = collectionVariablesIds.length;
    let collectionModes = collection.modes;
    let collectionModesLength = collectionModes.length;

    //Variables Loop
    for (let variableIdsCount = 0; variableIdsCount < collectionVariablesIdsLength; variableIdsCount++) {
      let variableIdsString = collectionVariablesIds[variableIdsCount];
      let variableObjet = figma.variables.getVariableById(`${variableIdsString}`);
      let getColor = variableObjet?.name;
      let getValueMode = variableObjet?.valuesByMode;
      let getResolveType = variableObjet?.resolvedType;
      let collectionModeArray : string[] = [];
      let collectionModeNameArray : string[] = [];   
       

      //Modes Loop
      for(let modesCount = 0 ; modesCount < collectionModesLength; modesCount++){
        const modeName = collectionModes[modesCount].name,
              modeIdString = collectionModes[modesCount].modeId;
        
        collectionModeArray.push(modeIdString);
        collectionModeNameArray.push(modeName);
      }

      //If variable type is a color
      if(getResolveType == 'COLOR' && getColor !== undefined) {
        // for(let modeCount = 0; modeCount < collectionModeArray.length; modeCount++) {
        // }
        //Push the color name to the array
        colorNames.push(getColor);
        modeNamesResult.push(getColor + ' ('+ collectionName +')');

      }
    }
  }

  // Function to know if a string contain a string
  function isSubstring(substring: string, string: string) {
    return string.includes(substring);
  }

  //If the key is a color
  if(key == 'color' || key == 'stroke_color'){
    choiceKey = [];
    choiceKey.push(key);

    //Show result on figma spotlight
    result.setSuggestions(modeNamesResult.filter(s => s.includes(query)))
  } else if(key == 'mode'){
    
    if(choiceKey[0] == "color"){
      let getColorVariables = figma.variables.getLocalVariables('COLOR');

      for(let colorsVariablesCount = 0; colorsVariablesCount < getColorVariables.length; colorsVariablesCount++){
      let getColorVariablesString = figma.variables.getLocalVariables('COLOR')[colorsVariablesCount].name.toLowerCase();
      let getParametersString = parameters.color.toLowerCase();
      let getCollectionID = figma.variables.getLocalVariables('COLOR')[colorsVariablesCount].variableCollectionId;

      if(isSubstring(getColorVariablesString, getParametersString)){
        let modeCollection = figma.variables.getVariableCollectionById(getCollectionID);
        let modeCollectionLength = modeCollection?.modes.length;
        if (modeCollectionLength !== undefined && modeCollection !== null) {
          for(let modeCollectionCount = 0; modeCollectionCount < modeCollectionLength; modeCollectionCount++){
            modeNames.push(modeCollection.modes[modeCollectionCount].name);
          }
        }
        
      }
      
    }
    result.setSuggestions(modeNames.filter(s => s.includes(query)))

    } else if(choiceKey[0] == "stroke_color"){
      let getColorVariables = figma.variables.getLocalVariables('COLOR');
      
      for(let colorsVariablesCount = 0; colorsVariablesCount < getColorVariables.length; colorsVariablesCount++){
        let getColorVariablesString = figma.variables.getLocalVariables('COLOR')[colorsVariablesCount].name.toLowerCase();
        let getParametersString = parameters.stroke_color.toLowerCase();
        let getCollectionID = figma.variables.getLocalVariables('COLOR')[colorsVariablesCount].variableCollectionId;

        if(isSubstring(getColorVariablesString, getParametersString)){
          let modeCollection = figma.variables.getVariableCollectionById(getCollectionID);
          let modeCollectionLength = modeCollection?.modes.length;

          if (modeCollectionLength !== undefined && modeCollection !== null) {
            for(let modeCollectionCount = 0; modeCollectionCount < modeCollectionLength; modeCollectionCount++){
              modeNames.push(modeCollection.modes[modeCollectionCount].name);
            }
          }
          
        }

      }
      result.setSuggestions(modeNames.filter(s => s.includes(query)))
    }
  }
})

figma.on('run', ({ command, parameters }: RunEvent) => {
  // VariableID:3:19 id couleur
  //Test
  const maVariable = figma.variables.getVariableById('VariableID:4:33');
  const maVariableColor = figma.variables.getVariableById('VariableID:3:19');
  // const maSelection: SceneNode = figma.currentPage.selection[0];
  const maSelection: RectangleNode = figma.currentPage.selection[0] as RectangleNode;

  if(maVariable && maSelection && maVariableColor){
    // const cloneSelection = maSelection.clone();
    maSelection.setBoundVariable('width', maVariable.id);
    // maSelection.setBoundVariable('itemSpacing', maVariable.id);

    const fillsCopy = clone(maSelection.fills);
    //     const fills = clone(rect.fills)
    // fills[0].color.r = 0.5
    // rect.fills = fills
    fillsCopy[0] = figma.variables.setBoundVariableForPaint(fillsCopy[0], 'color', maVariableColor)
    maSelection.fills = fillsCopy
        

    figma.currentPage.selection = [maSelection];

    

    switch(maSelection?.type as any){
      case 'RECTANGLE': 
        console.log('Je suis con')
      break;

      case 'STAR': 
        console.log('Je suis TROP BO')
      break;

      default:
        console.log("qu'est ce j'en sais bouffon");
        break;

    } 
    
  }
  




  // Function to know if a string contain a string
  // function isSubstring(substring: string, string: string) {
  //   return string.includes(substring);
  // }


  //   if (command == 'color') {
  //     if(parameters){        
  //      for(let colorNumber = 0; colorNumber < variableColorsLength; colorNumber++) {
  //         // if(parameters[command].toLowerCase() == variableColors[colorNumber].name.toLowerCase()) {
  //         if(isSubstring(variableColors[colorNumber].name.toLowerCase(), parameters[command].toLowerCase())) {
            
  //           const variableValue = variableColors[colorNumber].valuesByMode;
  //           let getCollectionByVariable = variableColors[colorNumber].variableCollectionId;
  //             //RENDRE DYNAMIQUE !!! 
  //             // Attention redondance de la boucle
  //             // Appliquer la variable et non la couleur
  //             //Notifications
  //             //Simplifier le code
  //             let modeCounterLoop = 0;

  //             for(const mode in variableValue) {
                
  //               let modeIdGetByColletion = figma.variables.getVariableCollectionById(getCollectionByVariable)?.modes[modeCounterLoop].modeId;
  //               let modeNameGetByColletion = figma.variables.getVariableCollectionById(getCollectionByVariable)?.modes[modeCounterLoop].name;
  //               let modeIdGetByColletionFirstChild = variableValue[Object.keys(variableValue)[0]];

  //               if(modeIdGetByColletion != undefined && modeNameGetByColletion?.toLowerCase() == parameters.mode?.toLowerCase()){

  //                 let colorRed = variableValue[`${mode}`]['r'],
  //                     colorGreen = variableValue[`${mode}`]['g'],
  //                     colorBlue = variableValue[`${mode}`]['b'],
  //                     colorAlpha = variableValue[`${mode}`]['a'],
  //                     fillColor = {r: colorRed, g: colorGreen, b: colorBlue};

  //                 const selection = figma.currentPage.selection;
  //                 for(let selectionCounter = 0; selectionCounter < selection.length; selectionCounter++){
  //                   const selectionArray = selection[selectionCounter];
  //                   switch (selectionArray.type) {
  //                     case "RECTANGLE":
  //                     case "ELLIPSE":
  //                     case "POLYGON":
  //                     case "FRAME":
  //                     case "INSTANCE":
  //                     case "SHAPE_WITH_TEXT":
  //                     case "STAR":
  //                     case "TABLE":
  //                     case "VECTOR":
  //                     case "TEXT":
  //                       // L'objet est d'un type qui a la propriété 'fills'
  //                       selectionArray.fills = [{ type: "SOLID", color: fillColor, opacity: colorAlpha }];
  //                       break;
  //                     case "SECTION":
  //                       selectionArray.fills = [{ type: "SOLID", color: fillColor, opacity: 0.2 }];
  //                       break;
  //                     default:
  //                       // Gérer les autres types d'objets ici
  //                       break;
  //                   }
  //                 }
  //               } else {                  
  //                 let colorRed = modeIdGetByColletionFirstChild['r'],
  //                     colorGreen = modeIdGetByColletionFirstChild['g'],
  //                     colorBlue = modeIdGetByColletionFirstChild['b'],
  //                     colorAlpha =modeIdGetByColletionFirstChild['a'],
  //                     fillColor = {r: colorRed, g: colorGreen, b: colorBlue};

  //                     const selection = figma.currentPage.selection;
  //                     for(let selectionCounter = 0; selectionCounter < selection.length; selectionCounter++){
  //                       const selectionArray = selection[selectionCounter];
  //                       switch (selectionArray.type) {
  //                         case "RECTANGLE":
  //                         case "ELLIPSE":
  //                         case "POLYGON":
  //                         case "FRAME":
  //                         case "INSTANCE":
  //                         case "SHAPE_WITH_TEXT":
  //                         case "STAR":
  //                         case "TABLE":
  //                         case "VECTOR":
  //                         case "TEXT":
  //                           // L'objet est d'un type qui a la propriété 'fills'
  //                           selectionArray.fills = [{ type: "SOLID", color: fillColor, opacity: colorAlpha }];
  //                           break;
  //                         case "SECTION":
  //                           selectionArray.fills = [{ type: "SOLID", color: fillColor, opacity: 0.2 }];
  //                           break;
  //                         default:
  //                           // Gérer les autres types d'objets ici
  //                           break;
  //                       }
  //                     }
  //               }
                
  //               modeCounterLoop = modeCounterLoop + 1;
  //           }
  //         }
  //       }
  //     }
  //   } else if(command == 'stroke_color'){
  //     if(parameters){
        
  //      for(let colorNumber = 0; colorNumber < variableColorsLength; colorNumber++) {
  //         // if(parameters[command].toLowerCase() == variableColors[colorNumber].name.toLowerCase()) {
  //           if(isSubstring(variableColors[colorNumber].name.toLowerCase(), parameters[command].toLowerCase())) {
            
  //           const variableValue = variableColors[colorNumber].valuesByMode;
  //           let getCollectionByVariable = variableColors[colorNumber].variableCollectionId;
  //           let modeCounterLoop = 0;

  //             for(const mode in variableValue) {
                
  //               let modeIdGetByColletion = figma.variables.getVariableCollectionById(getCollectionByVariable)?.modes[modeCounterLoop].modeId;
  //               let modeNameGetByColletion = figma.variables.getVariableCollectionById(getCollectionByVariable)?.modes[modeCounterLoop].name;
  //               let modeIdGetByColletionFirstChild = variableValue[Object.keys(variableValue)[0]];

  //               if(modeIdGetByColletion != undefined && modeNameGetByColletion?.toLowerCase() == parameters.mode?.toLowerCase()){

  //                 let colorRed = variableValue[`${mode}`]['r'],
  //                     colorGreen = variableValue[`${mode}`]['g'],
  //                     colorBlue = variableValue[`${mode}`]['b'],
  //                     colorAlpha = variableValue[`${mode}`]['a'],
  //                     fillColor = {r: colorRed, g: colorGreen, b: colorBlue};

  //                 const selection = figma.currentPage.selection;
  //                 for(let selectionCounter = 0; selectionCounter < selection.length; selectionCounter++){
  //                   const selectionArray = selection[selectionCounter];
  //                   switch (selectionArray.type) {
  //                     case "RECTANGLE":
  //                     case "ELLIPSE":
  //                     case "POLYGON":
  //                     case "FRAME":
  //                     case "INSTANCE":
  //                     case "SHAPE_WITH_TEXT":
  //                     case "STAR":
  //                     case "VECTOR":
  //                       // L'objet est d'un type qui a la propriété 'fills'
  //                       selectionArray.strokes = [{ type: "SOLID", color: fillColor, opacity: colorAlpha }];
  //                       break;
  //                     default:
  //                       // Gérer les autres types d'objets ici
  //                       break;
  //                   }
  //                 }
  //               } else {
                  
  //                 let colorRed = modeIdGetByColletionFirstChild['r'],
  //                     colorGreen = modeIdGetByColletionFirstChild['g'],
  //                     colorBlue = modeIdGetByColletionFirstChild['b'],
  //                     colorAlpha =modeIdGetByColletionFirstChild['a'],
  //                     fillColor = {r: colorRed, g: colorGreen, b: colorBlue};

  //                     const selection = figma.currentPage.selection;
  //                     for(let selectionCounter = 0; selectionCounter < selection.length; selectionCounter++){
  //                       const selectionArray = selection[selectionCounter];
  //                       switch (selectionArray.type) {
  //                         case "RECTANGLE":
  //                         case "ELLIPSE":
  //                         case "POLYGON":
  //                         case "FRAME":
  //                         case "INSTANCE":
  //                         case "SHAPE_WITH_TEXT":
  //                         case "STAR":
  //                         case "VECTOR":
  //                           // L'objet est d'un type qui a la propriété 'fills'
  //                           selectionArray.strokes  = [{ type: "SOLID", color: fillColor, opacity: colorAlpha }];
  //                           break;
  //                         default:
  //                           // Gérer les autres types d'objets ici
  //                           break;
  //                       }
  //                     }
  //               }
                
  //               modeCounterLoop = modeCounterLoop + 1;
  //           }
  //         }
  //       }
  //     }
  //   }
  figma.closePlugin()
})


function clone(val: any) {
  return JSON.parse(JSON.stringify(val))
}
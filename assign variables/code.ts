figma.parameters.on('input', ({query, result, key, parameters}) =>{  
  const getNumberVariable = figma.variables.getLocalVariables('FLOAT'),
        getColorVariable = figma.variables.getLocalVariables('COLOR'),
        getTextVariable = figma.variables.getLocalVariables('STRING');
  
  let colorNames: string[] = [];
  let colorObjects: any[] = [];
  let floatObjects: any[] = [];
  let textObjects: any[] = [];
  const emptySuggestionArray: string[] = ["You need variable to use this plugin"],
        emptyFloatSuggestionArray: string[] = ["You need number variable to use this"],
        emptyColorSuggestionArray: string[] = ["You need color variable to use this"];
  // Vérifier - changer les noms des appels et les retours des valeurs
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
      case 'shadowColor':
      case 'gridColor':
        // ATTENTION ERREUR AVEC LES FRAMES
     
      getColorVariable.forEach(color => {
        const colorCollectionId = color.variableCollectionId,
              colorCollectionName = figma.variables.getVariableCollectionById(colorCollectionId)?.name,
              colorName = color.name,
              colorVariableId = color.id,
              colorValueBrut = color.valuesByMode[Object.keys(color.valuesByMode)[0]],
              colorHexValue = rgbaToHex(colorValueBrut as RGBA);

        // let colorValueBrut = color.valuesByMode[Object.keys(color.valuesByMode)[0]];

              if(colorValueBrut !== null && typeof colorValueBrut === 'object'){
                if('id' in colorValueBrut){
                  let colorValueLinkedID = colorValueBrut.id;
                  let colorLinkedVariable = figma.variables.getVariableById(colorValueLinkedID);
                  if(colorLinkedVariable){
                    let colorLinkedVariableHex = rgbaToHex(colorLinkedVariable.valuesByMode[Object.keys(colorLinkedVariable.valuesByMode)[0]] as RGBA)

                    colorObjects.push({
                      name: colorName,
                      hexValue: colorLinkedVariableHex,
                      id: colorVariableId,
                      collectionName: colorCollectionName,
                      collectionId: colorCollectionId,
                      location: 'Local',
                      searchValue: colorName + ' --> ' + colorLinkedVariableHex 
                    }) 

                  }
                } else {
                  colorObjects.push({
                    name: colorName,
                    hexValue: colorHexValue,
                    id: colorVariableId,
                    collectionName: colorCollectionName,
                    collectionId: colorCollectionId,
                    location: 'Local',
                    searchValue: colorName + ' --> ' + colorHexValue 
                  }) 
                }
              }
              // Faire en sorte d'afficher les pourcentage d'opacité de la couleurs si il existe, sinon ne rien afficher 
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
                colorValueBrutImported = importedColor.valuesByMode[Object.keys(importedColor.valuesByMode)[0]],
                colorHexValueImported = rgbaToHex(colorValueBrutImported as RGBA);

              if(colorValueBrutImported !== null && typeof colorValueBrutImported === 'object'){
                if('id' in colorValueBrutImported){
                  let colorValueLinkedIDImported = colorValueBrutImported.id;
                  let colorLinkedVariableImported = figma.variables.getVariableById(colorValueLinkedIDImported);
                  
                  if(colorLinkedVariableImported){
                    let colorLinkedVariableHex = rgbaToHex(colorLinkedVariableImported.valuesByMode[Object.keys(colorLinkedVariableImported.valuesByMode)[0]] as RGBA)

                    colorObjects.push({
                      name: colorNameImported,
                      hexValue: colorLinkedVariableHex,
                      id: colorVariableIdImported,
                      collectionName: colorCollectionNameImported,
                      collectionId: colorCollectionId,
                      location: 'Imported',
                      searchValue: colorNameImported + ' --> ' + colorLinkedVariableHex
                    }) 
                  }
                } else {
                  colorObjects.push({
                    name: colorNameImported,
                    hexValue: colorHexValueImported,
                    id: colorVariableIdImported,
                    collectionName: colorCollectionNameImported,
                    collectionId: colorCollectionId,
                    location: 'Imported',
                    searchValue: colorNameImported + ' --> ' + colorHexValueImported
                  }) 
                }
              }
            });
            const suggestionsColor = colorObjects
              .filter(s => s.searchValue.includes(query))
              .map((s) => {
                return ({ 
                  name: s.searchValue,
                  icon: `<svg width="$size$" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="${s.hexValue}" /></svg>`,
                  data: {
                    variableID: s.id,
                    collectionId: s.collectionId,
                    localOrImported: s.location,
                  }})
              });
              
          result.setSuggestions(suggestionsColor);     
          });
        // }
      break;

      case 'border_width':
      case 'paddingSize':
        getNumberVariable.forEach(float => {
          const floatCollectionId = float.variableCollectionId,
                floatCollectionName = figma.variables.getVariableCollectionById(floatCollectionId)?.name,
                floatName = float.name,
                floatVariableId = float.id,
                floatValue = float.valuesByMode[Object.keys(float.valuesByMode)[0]] as number;

                // faire la condition si c'est une variable liée a une variable
  
            floatObjects.push({
              name: floatName,
              value: floatValue,
              id: floatVariableId,
              collectionName: floatCollectionName,
              collectionId: floatCollectionId,
              location: 'Local',
              searchValue: floatName + ' --> ' + floatValue
            })        
        });

        getLibraryCollections().then(() => {
          importedFloatVariable.forEach(importedFloat => {
            const floatCollectionId = importedFloat.variableCollectionId,
                  floatCollectionNameImported = figma.variables.getVariableCollectionById(floatCollectionId)?.name,
                  floatNameImported = importedFloat.name,
                  floatVariableIdImported = importedFloat.id,
                  floatValueImported = importedFloat.valuesByMode[Object.keys(importedFloat.valuesByMode)[0]] as number;

                  if (typeof floatValueImported === 'object' && floatValueImported !== null) {
                    let floatValueLinkedImported = floatValueImported as { id: string };
                    if ('id' in floatValueLinkedImported) {

                      let floatValueLinkedVariableImported = figma.variables.getVariableById(floatValueLinkedImported.id);
                      let floatValueLinkedVariableValueImported = floatValueLinkedVariableImported?.valuesByMode[Object.keys(floatValueLinkedVariableImported.valuesByMode)[0]];

                      floatObjects.push({
                        name: floatNameImported,
                        value: floatValueLinkedVariableValueImported,
                        id: floatVariableIdImported,
                        collectionName: floatCollectionNameImported,
                        collectionId: floatCollectionId,
                        location: 'Imported',
                        searchValue: floatNameImported+ ' --> ' + floatValueLinkedVariableValueImported
                      })  
                    } else {
                      floatObjects.push({
                        name: floatNameImported,
                        value: floatValueImported,
                        id: floatVariableIdImported,
                        collectionName: floatCollectionNameImported,
                        collectionId: floatCollectionId,
                        location: 'Imported',
                        searchValue: floatNameImported+ ' --> ' + floatValueImported
                      })  

                    }
                }
                  
            
            
          });
          // Est-ce toujours utils ? le plugin veut appliquer les variable, si pas mettre qu'on en a pas

          // if(floatObjects.length == 0){
          //   for(let numberCount = 0; numberCount <= 10; numberCount++){              
          //     floatObjects.push({
          //       name: '', 
          //       value: numberCount, 
          //       id: 'created/' + numberCount,
          //       collectionId: 'createdCollection/' + numberCount,
          //       location: 'created',
          //       searchValue: numberCount + 'px',
          //     })              
          //   }
          // } else {
            floatObjects.sort((a, b) => a.value - b.value);
          // }
          switch(key){
            case 'border_width':
              const suggestionsFloatBorder = floatObjects
                .filter(s => s.searchValue.includes(query))
                .map((s) => {              
                  const sizeFixe = 16;  
                  return ({ 
                    name: s.searchValue,
                    icon: `<svg width="${sizeFixe}" height="${sizeFixe}" viewBox="0 0 ${sizeFixe} ${sizeFixe}" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="${sizeFixe}" height="${sizeFixe}" fill="#ffffff" stroke="#1467a7" stroke-width="${s.value}"/></svg>`,
                    data: {
                      value : s.value,
                      variableID: s.id,
                      collectionId: s.collectionId,
                      localOrImported: s.location,
                    }})
              });
              result.setSuggestions(suggestionsFloatBorder); 
            break;
            default:
              const suggestionsFloat = floatObjects
                .filter(s => s.searchValue.includes(query))
                .map((s) => {              
                  return ({ 
                    name: s.searchValue,
                    data: {
                      value : s.value,
                      variableID: s.id,
                      collectionId: s.collectionId,
                      localOrImported: s.location,
                    }})
              });
              result.setSuggestions(suggestionsFloat);
            break;
          }
          
           
        });
      break;

      case 'height':
      case 'width':
      case 'radius':
      case 'minWidth':
      case 'maxWidth':
      case 'minHeight':
      case 'maxHeight':
      case 'gap_size':
      case 'opacity':
      case 'layerBlurSize':
      case 'backgroundBlurSize':
      case 'shadowBlur':
      case 'shadowX':
      case 'shadowY':
      case 'shadowSpread':
      case 'gridSize':
      case 'colCountCenter':
      case 'colWidthCenter':
      case 'colGutterCenter':
      case 'colCountStretch':
      case 'colMarginStretch':
      case 'colGutterStretch':
      case 'colCountLeft':
      case 'colWidthLeft':
      case 'colMarginLeft':
      case 'colGutterLeft':
      case 'colCountRight':
      case 'colWidthRight':
      case 'colMarginRight':
      case 'colGutterRight':
      case 'rowCountCenter':
      case 'rowWidthCenter':
      case 'rowGutterCenter':
      case 'rowCountStretch':
      case 'rowMarginStretch':
      case 'rowGutterStretch':
      case 'rowCountTop':
      case 'rowWidthTop':
      case 'rowMarginTop':
      case 'rowGutterTop':
      case 'rowCountBottom':
      case 'rowWidthBottom':
      case 'rowMarginBottom':
      case 'rowGutterBottom':
        getNumberVariable.forEach(float => {
          const floatCollectionId = float.variableCollectionId,
                floatCollectionName = figma.variables.getVariableCollectionById(floatCollectionId)?.name,
                floatName = float.name,
                floatVariableId = float.id,
                floatValue = float.valuesByMode[Object.keys(float.valuesByMode)[0]] as number;
  
              switch(key){
                case 'height':
                case "width":
                case "minWidth":
                case "maxWidth":
                case "minHeight":
                case "maxHeight":
                  if(float.scopes.toString().includes('WIDTH_HEIGHT') || float.scopes.toString().includes('ALL_SCOPES')){
                    floatObjects.push({
                      name: floatName,
                      value: floatValue,
                      id: floatVariableId,
                      collectionName: floatCollectionName,
                      collectionId: floatCollectionId,
                      location: 'Local',
                      searchValue: floatName + ' --> ' + floatValue
                    })
                  }
                break;

                case "gap_size":
                  if(float.scopes.toString().includes('GAP') || float.scopes.toString().includes('ALL_SCOPES')){
                    floatObjects.push({
                      name: floatName,
                      value: floatValue,
                      id: floatVariableId,
                      collectionName: floatCollectionName,
                      collectionId: floatCollectionId,
                      location: 'Local',
                      searchValue: floatName + ' --> ' + floatValue
                    })
                  }
                break;
                case "radius":
                  // ne fonctionne plus
                  if(float.scopes.toString().includes('CORNER_RADIUS') || float.scopes.toString().includes('ALL_SCOPES')){
                    floatObjects.push({
                      name: floatName,
                      value: floatValue,
                      id: floatVariableId,
                      collectionName: floatCollectionName,
                      collectionId: floatCollectionId,
                      location: 'Local',
                      searchValue: floatName + ' --> ' + floatValue
                    })
                  }
                break;
                case 'opacity':
                  if(float.scopes.toString().includes('OPACITY')){
                    floatObjects.push({
                      name: floatName,
                      value: floatValue,
                      id: floatVariableId,
                      collectionName: floatCollectionName,
                      collectionId: floatCollectionId,
                      location: 'Local',
                      searchValue: floatName + ' --> ' + floatValue
                    })
                  }
                break;
                case 'layerBlurSize':
                case 'backgroundBlurSize':
                case 'shadowBlur':
                case 'shadowX':
                case 'shadowY':
                case 'shadowSpread':
                  if(float.scopes.toString().includes('EFFECT_FLOAT') || float.scopes.toString().includes('ALL_SCOPES')){
                    floatObjects.push({
                      name: floatName,
                      value: floatValue,
                      id: floatVariableId,
                      collectionName: floatCollectionName,
                      collectionId: floatCollectionId,
                      location: 'Local',
                      searchValue: floatName + ' --> ' + floatValue
                    })
                  }
                break;
                default:
                  // if(float.scopes.toString().includes('ALL_SCOPES')){
                    floatObjects.push({
                      name: floatName,
                      value: floatValue,
                      id: floatVariableId,
                      collectionName: floatCollectionName,
                      collectionId: floatCollectionId,
                      location: 'Local',
                      searchValue: floatName + ' --> ' + floatValue
                    })
                  // }
                break;
              }
        });
        getLibraryCollections().then(() => {
          importedFloatVariable.forEach(importedFloat => {
            const floatCollectionId = importedFloat.variableCollectionId,
                  floatCollectionNameImported = figma.variables.getVariableCollectionById(floatCollectionId)?.name,
                  floatNameImported = importedFloat.name,
                  floatVariableIdImported = importedFloat.id,
                  floatValueImported = importedFloat.valuesByMode[Object.keys(importedFloat.valuesByMode)[0]] as number;

            switch(key){
              case 'height':
              case "width":
              case "minWidth":
              case "maxWidth":
              case "minHeight":
              case "maxHeight":
                if(importedFloat.scopes.toString().includes('WIDTH_HEIGHT') || importedFloat.scopes.toString().includes('ALL_SCOPES')){
                  floatObjects.push({
                    name: floatNameImported,
                    value: floatValueImported,
                    id: floatVariableIdImported,
                    collectionName: floatCollectionNameImported,
                    collectionId: floatCollectionId,
                    location: 'Imported',
                    searchValue: floatNameImported + ' --> ' + floatValueImported
                  })  
                }
              break;

              case "gap_size":
                if(importedFloat.scopes.toString().includes('GAP') || importedFloat.scopes.toString().includes('ALL_SCOPES')){
                  floatObjects.push({
                    name: floatNameImported,
                    value: floatValueImported,
                    id: floatVariableIdImported,
                    collectionName: floatCollectionNameImported,
                    collectionId: floatCollectionId,
                    location: 'Imported',
                    searchValue: floatNameImported + ' --> ' + floatValueImported
                  })
                }
              break;
              case "radius":
                if(importedFloat.scopes.toString().includes('CORNER_RADIUS') || importedFloat.scopes.toString().includes('ALL_SCOPES')){
                  floatObjects.push({
                    name: floatNameImported,
                    value: floatValueImported,
                    id: floatVariableIdImported,
                    collectionName: floatCollectionNameImported,
                    collectionId: floatCollectionId,
                    location: 'Imported',
                    searchValue: floatNameImported + ' --> ' + floatValueImported
                  })
                }
              break;

              case 'opacity':
                if(importedFloat.scopes.toString().includes('OPACITY')){
                  floatObjects.push({
                    name: floatNameImported,
                    value: floatValueImported,
                    id: floatVariableIdImported,
                    collectionName: floatCollectionNameImported,
                    collectionId: floatCollectionId,
                    location: 'Imported',
                    searchValue: floatNameImported + ' --> ' + floatValueImported
                  })
                }
                break;
                case 'layerBlurSize':
                case 'backgroundBlurSize':
                case 'shadowBlur':
                case 'shadowX':
                case 'shadowY':
                case 'shadowSpread':
                  if(importedFloat.scopes.toString().includes('EFFECT_FLOAT') || importedFloat.scopes.toString().includes('ALL_SCOPES')){
                    floatObjects.push({
                      name: floatNameImported,
                      value: floatValueImported,
                      id: floatVariableIdImported,
                      collectionName: floatCollectionNameImported,
                      collectionId: floatCollectionId,
                      location: 'Imported',
                      searchValue: floatNameImported + ' --> ' + floatValueImported
                    })
                  }
                break;
                default:
                  // if(importedFloat.scopes.toString().includes('ALL_SCOPES')){
                    floatObjects.push({
                      name: floatNameImported,
                      value: floatValueImported,
                      id: floatVariableIdImported,
                      collectionName: floatCollectionNameImported,
                      collectionId: floatCollectionId,
                      location: 'Imported',
                      searchValue: floatNameImported + ' --> ' + floatValueImported
                    })
                  // }
                break;
            }
          });

          floatObjects.sort((a, b) => a.value - b.value);
          
          const suggestionsFloat = floatObjects
          .filter(s => s.searchValue.includes(query))
          .map((s) => {              
            return ({ 
              name: s.searchValue,
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

      case 'paddingPosition':
        const sizeFixe = 16,
              littleSize = 4,
              bigSize = 14,
              littlePosition = 1,
              bigPosition = 11;
        let paddingPositionArray: any[] = [{
          searchValue: 'Top & bottom',
          devValue: ['paddingTop', 'paddingBottom'],
          paddingWidth: bigSize,
          paddingHeight: littleSize,
          paddingPositionX: littlePosition,
          paddingPositionY: littlePosition,
          paddingWidthSecond: bigSize,
          paddingHeightSecond: littleSize,
          paddingPositionXSecond: littlePosition,
          paddingPositionYSecond: bigPosition,
          visibilitySecond: "visible"
        },
        {
          searchValue: 'Left & Right',
          devValue: ['paddingLeft', 'paddingRight'],
          paddingWidth: littleSize,
          paddingHeight: bigSize,
          paddingPositionX: littlePosition,
          paddingPositionY: littlePosition,
          paddingWidthSecond: littleSize,
          paddingHeightSecond: bigSize,
          paddingPositionXSecond: bigPosition,
          paddingPositionYSecond: littlePosition,
          visibilitySecond: "visible"
        },
        {
          searchValue: 'Top',
          devValue: ['paddingTop'],
          paddingWidth: bigSize,
          paddingHeight: littleSize,
          paddingPositionX: littlePosition,
          paddingPositionY: littlePosition,
          paddingWidthSecond: bigSize,
          paddingHeightSecond: littleSize,
          paddingPositionXSecond: littlePosition,
          paddingPositionYSecond: bigPosition,
          visibilitySecond: "hidden"
        },
        {
          searchValue: 'Bottom',
          devValue: ['paddingBottom'],
          paddingWidth: bigSize,
          paddingHeight: littleSize,
          paddingPositionX: littlePosition,
          paddingPositionY: bigPosition,
          paddingWidthSecond: bigSize,
          paddingHeightSecond: littleSize,
          paddingPositionXSecond: littlePosition,
          paddingPositionYSecond: bigPosition,
          visibilitySecond: "hidden"
        },
        {
          searchValue: 'Left',
          devValue: ['paddingLeft'],
          paddingWidth: littleSize,
          paddingHeight: bigSize,
          paddingPositionX: littlePosition,
          paddingPositionY: littlePosition,
          paddingWidthSecond: bigSize,
          paddingHeightSecond: littleSize,
          paddingPositionXSecond: littlePosition,
          paddingPositionYSecond: bigPosition,
          visibilitySecond: "hidden"
        },
        {
          searchValue: 'Right',
          devValue: ['paddingRight'],
          paddingWidth: littleSize,
          paddingHeight: bigSize,
          paddingPositionX: bigPosition,
          paddingPositionY: littlePosition,
          paddingWidthSecond: bigSize,
          paddingHeightSecond: littleSize,
          paddingPositionXSecond: littlePosition,
          paddingPositionYSecond: bigPosition,
          visibilitySecond: "hidden"
        }];

        const suggestionsPaddingPosition = paddingPositionArray
            .filter(s => s.searchValue.includes(query))
            .map((s) => {                  
                  return ({
                    name: s.searchValue, 
                    icon: `<svg width="${sizeFixe}" height="${sizeFixe}" viewBox="0 0 ${sizeFixe} ${sizeFixe}" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="${sizeFixe}" height="${sizeFixe}" fill="#ffffff" x="0" y="0"/>
                              <rect width="${s.paddingWidth}" height="${s.paddingHeight}" x="${s.paddingPositionX}" y="${s.paddingPositionY}" rx="1" fill="#1467a7"/>
                              <rect width="${s.paddingWidthSecond}" height="${s.paddingHeightSecond}" x="${s.paddingPositionXSecond}" y="${s.paddingPositionYSecond}" visibility="${s.visibilitySecond}" rx="1" fill="#1467a7"/>
                            </svg>`,
                    data: {
                      value: s.devValue,
                    }
                  });
              });
            
        result.setSuggestions(suggestionsPaddingPosition);
      break;

      case 'border_position':
        // L'applicaiton ne marche pas 
        const sizeFixeBorder = 16,
              littleSizeBorder = 4,
              bigSizeBorder = 14,
              littlePositionBorder = 1,
              bigPositionBorder = 11;
        let borderPositionArray: any[] = [{
          searchValue: 'All',
          devValue: ['strokeTopWeight', 'strokeBottomWeight', 'strokeRightWeight' , 'strokeLeftWeight'],
          borderWidth: sizeFixeBorder,
          borderHeight: sizeFixeBorder,
          borderPositionX: 0,
          borderPositionY: 0,
          borderWidthSecond: bigSizeBorder,
          borderHeightSecond: littleSizeBorder,
          borderPositionXSecond: littlePositionBorder,
          borderPositionYSecond: bigPositionBorder,
          strokeWidth: 6,
          svgBackground: '#FFFFFF',
          visibilitySecond: "hidden"
        },{
          searchValue: 'Top & bottom',
          devValue: ['strokeTopWeight', 'strokeBottomWeight'],
          borderWidth: bigSizeBorder,
          borderHeight: littleSizeBorder,
          borderPositionX: littlePositionBorder,
          borderPositionY: littlePositionBorder,
          borderWidthSecond: bigSizeBorder,
          borderHeightSecond: littleSizeBorder,
          borderPositionXSecond: littlePositionBorder,
          borderPositionYSecond: bigPositionBorder,
          strokeWidth : 0,
          svgBackground: '#0D99FF',
          visibilitySecond: "visible"
        },
        {
          searchValue: 'Left & Right',
          devValue: ['strokeLeftWeight', 'strokeRightWeight'],
          borderWidth: littleSizeBorder,
          borderHeight: bigSizeBorder,
          borderPositionX: littlePositionBorder,
          borderPositionY: littlePositionBorder,
          borderWidthSecond: littleSizeBorder,
          borderHeightSecond: bigSizeBorder,
          borderPositionXSecond: bigPositionBorder,
          borderPositionYSecond: littlePositionBorder,
          strokeWidth : 0,
          svgBackground: '#0D99FF',
          visibilitySecond: "visible"
        },
        {
          searchValue: 'Top',
          devValue: ['strokeTopWeight'],
          borderWidth: bigSizeBorder,
          borderHeight: littleSizeBorder,
          borderPositionX: littlePositionBorder,
          borderPositionY: littlePositionBorder,
          borderWidthSecond: bigSizeBorder,
          borderHeightSecond: littleSizeBorder,
          borderPositionXSecond: littlePositionBorder,
          borderPositionYSecond: bigPositionBorder,
          strokeWidth : 0,
          svgBackground: '#0D99FF',
          visibilitySecond: "hidden"
        },
        {
          searchValue: 'Bottom',
          devValue: ['strokeBottomWeight'],
          borderWidth: bigSizeBorder,
          borderHeight: littleSizeBorder,
          borderPositionX: littlePositionBorder,
          borderPositionY: bigPositionBorder,
          borderWidthSecond: bigSizeBorder,
          borderHeightSecond: littleSizeBorder,
          borderPositionXSecond: littlePositionBorder,
          borderPositionYSecond: bigPositionBorder,
          strokeWidth : 0,
          svgBackground: '#0D99FF',
          visibilitySecond: "hidden"
        },
        {
          searchValue: 'Left',
          devValue: ['strokeLeftWeight'],
          borderWidth: littleSizeBorder,
          borderHeight: bigSizeBorder,
          borderPositionX: littlePositionBorder,
          borderPositionY: littlePositionBorder,
          borderWidthSecond: bigSizeBorder,
          borderHeightSecond: littleSizeBorder,
          borderPositionXSecond: littlePositionBorder,
          borderPositionYSecond: bigPositionBorder,
          strokeWidth : 0,
          svgBackground: '#0D99FF',
          visibilitySecond: "hidden"
        },
        {
          searchValue: 'Right',
          devValue: ['strokeRightWeight'],
          borderWidth: littleSizeBorder,
          borderHeight: bigSizeBorder,
          borderPositionX: bigPositionBorder,
          borderPositionY: littlePositionBorder,
          borderWidthSecond: bigSizeBorder,
          borderHeightSecond: littleSizeBorder,
          borderPositionXSecond: littlePositionBorder,
          borderPositionYSecond: bigPositionBorder,
          strokeWidth : 0,
          svgBackground: '#0D99FF',
          visibilitySecond: "hidden"
        }];        

        // ne s'applique que en full
        const suggestionsBorderPosition = borderPositionArray
            .filter(s => s.searchValue.includes(query))
            .map((s) => {                  
                  return ({
                    name: s.searchValue, 
                    icon: `<svg width="${sizeFixeBorder}" height="${sizeFixeBorder}" viewBox="0 0 ${sizeFixeBorder} ${sizeFixeBorder}" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="${sizeFixeBorder}" height="${sizeFixeBorder}" fill="#ffffff" x="0" y="0"/>
                              <rect width="${s.borderWidth}" height="${s.borderHeight}" x="${s.borderPositionX}" y="${s.borderPositionY}" rx="1" fill="${s.svgBackground}" stroke="#1467a7" stroke-width="${s.strokeWidth}"/>
                              <rect width="${s.borderWidthSecond}" height="${s.borderHeightSecond}" x="${s.borderPositionXSecond}" y="${s.borderPositionYSecond}" visibility="${s.visibilitySecond}" rx="1" fill="#1467a7"/>
                            </svg>`,
                    data: {
                      value: s.devValue,
                    }
                  });
              });
            
        result.setSuggestions(suggestionsBorderPosition);
      break;

      case 'radiusPosition':
        let radiusPositionArray: any[] = [{
          searchValue: 'Top',
          devValue: ['topLeftRadius', 'topRightRadius'],
          xPosition: 0,
          yPosition: 0,
          height: 26,
          width: 16
        },
        {
          searchValue: 'Right',
          devValue: ['bottomRightRadius', 'topRightRadius'],
          xPosition: -10,
          yPosition: 0,
          height: 16,
          width: 26
        },
        {
          searchValue: 'Bottom',
          devValue: ['bottomRightRadius', 'bottomLeftRadius'],
          xPosition: 0,
          yPosition: -10,
          height: 26,
          width: 16
        },
        {
          searchValue: 'Left',
          devValue: ['bottomLeftRadius', 'topLeftRadius'],
          xPosition: 0,
          yPosition: 0,
          height: 16,
          width: 26
        },
        {
          searchValue: 'Top left',
          devValue: ['topLeftRadius'],
          xPosition: 0,
          yPosition: 0,
          height: 26,
          width: 26
        },
        {
          searchValue: 'Top Right',
          devValue: ['topRightRadius'],
          xPosition: -10,
          yPosition: 0,
          height: 26,
          width: 26
        },
        {
          searchValue: 'Bottom Right',
          devValue: ['bottomRightRadius'],
          xPosition: -10,
          yPosition: -10,
          height: 26,
          width: 26
        },
        {
          searchValue: 'Bottom Left',
          devValue: ['bottomLeftRadius'],
          xPosition: 0,
          yPosition: -10,
          height: 26,
          width: 26
        }];
        const suggestionsRadius = radiusPositionArray
            .filter(s => s.searchValue.includes(query))
            .map((s) => {
              let sizeFixe = 16,
                  radiusSize = 6;

              return ({ 
                name: s.searchValue,
                icon: `<svg width="${sizeFixe}" height="${sizeFixe}" viewBox="0 0 ${sizeFixe} ${sizeFixe}" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="${s.width}" height="${s.height}" fill="#ffffff"  rx="${radiusSize}" x="${s.xPosition}" y="${s.yPosition}"/>
                      </svg>`,
                data: {
                  value: s.devValue
                }
              });
            });
            
        result.setSuggestions(suggestionsRadius);
      break;
      case 'character':
        getTextVariable.forEach(text => {
          const textCollectionId = text.variableCollectionId,
                textCollectionName = figma.variables.getVariableCollectionById(textCollectionId)?.name,
                textName = text.name,
                textVariableId = text.id,
                textString = text.valuesByMode[Object.keys(text.valuesByMode)[0]];                
  
          textObjects.push({
            name: textName,
            id: textVariableId,
            collectionName: textCollectionName,
            collectionId: textCollectionId,
            searchValue: textName + ' --> ' + textString
          })        
        });

        getLibraryCollections().then(() => {
          importedTextVariable.forEach(importedtext => {
            const textCollectionId = importedtext.variableCollectionId,
              textCollectionNameImported = figma.variables.getVariableCollectionById(textCollectionId)?.name,
              textNameImported = importedtext.name,
              textVariableIdImported = importedtext.id,
              textStringImported = importedtext.valuesByMode[Object.keys(importedtext.valuesByMode)[0]];

            textObjects.push({
              name: textNameImported,
              id: textVariableIdImported,
              collectionName: textCollectionNameImported,
              collectionId: textCollectionId,
              searchValue: textNameImported + ' --> ' + textStringImported
            })  
            
          });     
          const suggestionsColor = textObjects
            .filter(s => s.searchValue.includes(query))
            .map((s, index) => {
              const currentText = textObjects[index]
              return ({ 
                name: s.searchValue,
                data: {
                  variableID: currentText.id,
                  collectionId: currentText.collectionId,
                }})
            });
            
        result.setSuggestions(suggestionsColor);     
        });
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
        let selectedColorVariable = figma.variables.getVariableById(key.variableID);
        if(mySelection.length > 0){          
          mySelection.forEach(selectedObject => {
            if ('fills' in selectedObject && selectedColorVariable) {
              if(selectedObject.fills.toLocaleString() === ""){
                selectedObject.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
              }
              const fillsCopy = clone(selectedObject.fills);
              fillsCopy[0] = figma.variables.setBoundVariableForPaint(fillsCopy[0], 'color', selectedColorVariable)
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
                if(parameters['border_position'] != undefined){
                  parameters['border_position'].value.forEach((borderPosition: any) => {
                    selectedObject.setBoundVariable(borderPosition, parameters['border_width'].variableID)
                  });
                } else {
                  selectedObject.setBoundVariable('strokeWeight', parameters['border_width'].variableID);
                }    
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
      let selectedfloatVariable = figma.variables.getVariableById(key.variableID);
        if(mySelection.length > 0){          
          mySelection.forEach(selectedObject => {
            if (selectedfloatVariable) {
              selectedObject.setBoundVariable(command, selectedfloatVariable.id);
            }
          });
        } else {
          figma.notify('Please, select an item')
        }
      break;

      case 'padding':
        const paddingSizeVariableID = parameters['paddingSize'].variableID as string;
                                
        if(mySelection.length > 0){
          mySelection.forEach(selectedObject => {
            if(mySelection[0].type == 'FRAME' && mySelection[0].layoutMode != 'NONE'){
              if(parameters['paddingPosition']){
                let paddingPositionParameter = parameters['paddingPosition'].value;
                paddingPositionParameter.forEach((paddingPosition: any) => {
                  selectedObject.setBoundVariable(paddingPosition, paddingSizeVariableID);
                });
              } else {
                selectedObject.setBoundVariable('paddingBottom', paddingSizeVariableID);
                selectedObject.setBoundVariable('paddingTop', paddingSizeVariableID);
                selectedObject.setBoundVariable('paddingRight', paddingSizeVariableID);
                selectedObject.setBoundVariable('paddingLeft', paddingSizeVariableID);
              }
            } else {
              figma.notify("Auto layout required for padding... Sorry")
            }     
          });
        } else {
          figma.notify('Please select an item')
        }
      break;

      case 'radius':
        const radiusSizeVariableID = parameters['radius'].variableID as string;
        // let radiusLoopCount = 0;
        if(figma.currentPage.selection.length > 0){
          mySelection.forEach(selectedObject => {
            if(parameters['radiusPosition']){
              parameters['radiusPosition'].value.forEach((radiusPosition: any) => {
                selectedObject.setBoundVariable(radiusPosition, radiusSizeVariableID);
              });
            } else {
              selectedObject.setBoundVariable('bottomLeftRadius' , radiusSizeVariableID)
              selectedObject.setBoundVariable('bottomRightRadius' , radiusSizeVariableID)
              selectedObject.setBoundVariable('topLeftRadius' , radiusSizeVariableID)
              selectedObject.setBoundVariable('topRightRadius' , radiusSizeVariableID)
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
              selectedObject.setBoundVariable("itemSpacing", parameterKey.variableID)
              selectedObject.setBoundVariable("counterAxisSpacing", parameterKey.variableID)
            }
          });
        } else {
          figma.notify('Please select an item')
        }
      break;
      case 'character':        
        if(mySelection.length > 0){
          mySelection.forEach(selectedObject => {
            if(selectedObject.type == 'TEXT'){
              selectedObject.setBoundVariable('characters', parameters[command].variableID)
            } else {
              figma.notify('Please select a text layer')
            }
          });
        } else {
          figma.notify('Please select an item')
        }
      break;
      case 'opacity':
        if(mySelection.length > 0){
          mySelection.forEach(selectedObject => {
              selectedObject.setBoundVariable('opacity', parameters[command].variableID)
          });
        } else {
          figma.notify('Please select an item')
        }
      break;
      case 'dropShadow':
      case 'innerShadow':
        let currentShadowXVariable = figma.variables.getVariableById(parameters['shadowX'].variableID),
            currentShadowYVariable = figma.variables.getVariableById(parameters['shadowY'].variableID),
            currentShadowBlurVariable = figma.variables.getVariableById(parameters['shadowBlur'].variableID),
            currentShadowColorVariable = figma.variables.getVariableById(parameters['shadowColor'].variableID);

        if(mySelection.length > 0){
          mySelection.forEach(shadow => {
            if('effects' in shadow){
              let shadowArrayCounter = 0;
              
              let globalCounter = effectsCounter(shadow);
              switch(command){
                case 'dropShadow':
                  if(globalCounter.dropShadow == 0){
                    let effectsArray = shadow.effects,
                        temporaryCopyEffects = [...effectsArray];
                    
                    temporaryCopyEffects.forEach((temporaryCopy, index) => {                  
                      switch(temporaryCopy.type){
                        case 'LAYER_BLUR':
                        case 'BACKGROUND_BLUR':
                          let temporaryBoundVariable = {...temporaryCopy};
    
                          if(temporaryCopy.boundVariables){
                            for(let radiusKey in temporaryCopy.boundVariables){
                              if(radiusKey == 'radius'){
                                  let radiusCopy = temporaryCopy.boundVariables[radiusKey];
    
                                if(radiusCopy?.id){
                                    temporaryBoundVariable.boundVariables = {radius: {type: radiusCopy?.type || 'VARIABLE_ALIAS', id: radiusCopy?.id}};
                                }
                                
                                temporaryCopy = temporaryBoundVariable;
                                temporaryCopyEffects[index] = temporaryCopy;
                              }
                            }
                          }
                        break;
                      }
                    });
    
                    shadow.effects = temporaryCopyEffects;
    
                    temporaryCopyEffects.push({
                      type: 'DROP_SHADOW',
                      radius: 10,
                      offset: { x: 4, y: 4 },
                      spread: 0,
                      color: { r: 0, g: 0, b: 0, a: 0.25 },
                      visible: true,
                      blendMode: 'NORMAL', 
                      boundVariables: {}
                    })
                    shadow.effects = temporaryCopyEffects;
                  }
                break;
                case 'innerShadow':
                  if(globalCounter.innerShadow == 0){
                    let effectsArray = shadow.effects,
                        temporaryCopyEffects = [...effectsArray];
                    
                    temporaryCopyEffects.forEach((temporaryCopy, index) => {                  
                      switch(temporaryCopy.type){
                        case 'LAYER_BLUR':
                        case 'BACKGROUND_BLUR':
                          let temporaryBoundVariable = {...temporaryCopy};
    
                          if(temporaryCopy.boundVariables){
                            for(let radiusKey in temporaryCopy.boundVariables){
                              if(radiusKey == 'radius'){
                                  let radiusCopy = temporaryCopy.boundVariables[radiusKey];
    
                                if(radiusCopy?.id){
                                    temporaryBoundVariable.boundVariables = {radius: {type: radiusCopy?.type || 'VARIABLE_ALIAS', id: radiusCopy?.id}};
                                }
                                
                                temporaryCopy = temporaryBoundVariable;
                                temporaryCopyEffects[index] = temporaryCopy;
                              }
                            }
                          }
                        break;
                      }
                    });
    
                    shadow.effects = temporaryCopyEffects;
    
                    temporaryCopyEffects.push({
                      type: 'INNER_SHADOW',
                      radius: 10,
                      offset: { x: 4, y: 4 },
                      spread: 0,
                      color: { r: 0, g: 0, b: 0, a: 0.25 },
                      visible: true,
                      blendMode: 'NORMAL', 
                      boundVariables: {}
                    })
                    shadow.effects = temporaryCopyEffects;
                  }
                break;
              }
              

              let effectsCopy = clone(shadow.effects);              

              effectsCopy.forEach((currentEffectCopy: any) => {
                switch(command){
                  case 'dropShadow':
                    if(currentEffectCopy.type == 'DROP_SHADOW'){
                      if(currentShadowBlurVariable && currentShadowXVariable && currentShadowYVariable && currentShadowColorVariable != undefined){
                        effectsCopy[shadowArrayCounter] = figma.variables.setBoundVariableForEffect(effectsCopy[shadowArrayCounter], 'radius', currentShadowBlurVariable)
                        effectsCopy[shadowArrayCounter] = figma.variables.setBoundVariableForEffect(effectsCopy[shadowArrayCounter], 'offsetX', currentShadowXVariable)
                        effectsCopy[shadowArrayCounter] = figma.variables.setBoundVariableForEffect(effectsCopy[shadowArrayCounter], 'offsetY', currentShadowYVariable)
                        effectsCopy[shadowArrayCounter] = figma.variables.setBoundVariableForEffect(effectsCopy[shadowArrayCounter], 'color', currentShadowColorVariable)
                      }
                      if(parameters['shadowSpread'] != undefined){
                        let currentShadowSpreadVariable = figma.variables.getVariableById(parameters['shadowSpread'].variableID)
                        if(currentShadowSpreadVariable){                      
                          effectsCopy[shadowArrayCounter] = figma.variables.setBoundVariableForEffect(effectsCopy[shadowArrayCounter], 'spread', currentShadowSpreadVariable); 
                        }
                      }
                      shadow.effects = effectsCopy;                  
                    }
                  break;

                  case 'innerShadow':
                    if(currentEffectCopy.type == 'INNER_SHADOW'){
                      if(currentShadowBlurVariable && currentShadowXVariable && currentShadowYVariable && currentShadowColorVariable != undefined){
                        effectsCopy[shadowArrayCounter] = figma.variables.setBoundVariableForEffect(effectsCopy[shadowArrayCounter], 'radius', currentShadowBlurVariable)
                        effectsCopy[shadowArrayCounter] = figma.variables.setBoundVariableForEffect(effectsCopy[shadowArrayCounter], 'offsetX', currentShadowXVariable)
                        effectsCopy[shadowArrayCounter] = figma.variables.setBoundVariableForEffect(effectsCopy[shadowArrayCounter], 'offsetY', currentShadowYVariable)
                        effectsCopy[shadowArrayCounter] = figma.variables.setBoundVariableForEffect(effectsCopy[shadowArrayCounter], 'color', currentShadowColorVariable)
                      }
                      if(parameters['shadowSpread'] != undefined){
                        let currentShadowSpreadVariable = figma.variables.getVariableById(parameters['shadowSpread'].variableID)
                        if(currentShadowSpreadVariable){                      
                          effectsCopy[shadowArrayCounter] = figma.variables.setBoundVariableForEffect(effectsCopy[shadowArrayCounter], 'spread', currentShadowSpreadVariable); 
                        }
                      }
                      shadow.effects = effectsCopy;                  
                    }
                  break;
                }
                
                shadowArrayCounter++;
              });
            }          
          });
        } else {
          figma.notify('Please select an item')
        }
      break;
      case 'backgroundBlur':
      case 'layerBlur':
        if(mySelection.length > 0){
          mySelection.forEach(blur => {    
            let globalCounter = effectsCounter(blur)    
            
            if('effects' in blur){
              if(globalCounter.backgroundBlur > 0){
                let effectsCopy = clone(blur.effects);
                let notBackgroundBlurArray: any[] = [];
                effectsCopy.forEach((currentEffectCopy: any) => {
                  switch(command){
                    case 'backgroundBlur':
                      if(currentEffectCopy.type != 'BACKGROUND_BLUR'){
                        notBackgroundBlurArray.push(currentEffectCopy);
                      }
                    break;
                    case 'layerBlur':
                      if(currentEffectCopy.type != 'LAYER_BLUR'){
                        notBackgroundBlurArray.push(currentEffectCopy);
                      }
                    break;
                  }
                  
                });
                blur.effects = notBackgroundBlurArray;
              }
              let effectsArray = blur.effects,
                  temporaryCopyEffects = [...effectsArray];
              switch(command){
                case 'backgroundBlur':
                  temporaryCopyEffects.push({
                    type: 'BACKGROUND_BLUR',
                    radius: parameters['backgroundBlurSize'].value,
                    visible: true,
                    boundVariables: {
                      radius : {
                        id: parameters['backgroundBlurSize'].variableID,
                        type: 'VARIABLE_ALIAS'
                      }
                    }
                  })
                break;
                case 'layerBlur':
                  temporaryCopyEffects.push({
                    type: 'LAYER_BLUR',
                    radius: parameters['layerBlurSize'].value,
                    visible: true,
                    boundVariables: {
                      radius : {
                        id: parameters['layerBlurSize'].variableID,
                        type: 'VARIABLE_ALIAS'
                      }
                    }
                  })
                break;
              }              
              blur.effects = temporaryCopyEffects;
            }          
          });
        } else {
          figma.notify('Please select an item')
        }
      break;
      case 'grid':
        let selectedGridSizeVariable = figma.variables.getVariableById(parameters['gridSize'].variableID);

        mySelection.forEach(selectedObject => {
          if('layoutGrids' in selectedObject){
            let layoutGridCopy = clone(selectedObject.layoutGrids);
            let gridLayoutTypeCounter = gridCounter(selectedObject);

            if(gridLayoutTypeCounter.grid == 0){
              layoutGridCopy.push({
                    "pattern": "GRID",
                    "visible": true,
                    "color": {
                        "r": 1,
                        "g": 0,
                        "b": 0,
                        "a": 0.10000000149011612
                    },
                    "boundVariables": {
                        "sectionSize": {
                            "type": "VARIABLE_ALIAS",
                            "id": parameters['gridSize'].variableID
                        }
                    },
                    "sectionSize": parameters['gridSize'].value
                })        
            } else {
              layoutGridCopy.forEach((gridItem: any, index: number) => {              
                if(gridItem.pattern == 'GRID' && selectedGridSizeVariable){
                  layoutGridCopy[index] = figma.variables.setBoundVariableForLayoutGrid(layoutGridCopy[index], 'sectionSize', selectedGridSizeVariable)
                }
              });
            }
            selectedObject.layoutGrids = layoutGridCopy; 
          }
        });
      break;
      case 'gridColumnCenter':
        let selectedGridColumnNumberVariable = figma.variables.getVariableById(parameters['colCountCenter'].variableID),
            selectedGridColumnWidthVariable = figma.variables.getVariableById(parameters['colWidthCenter'].variableID),
            selectedGridColumnGutterVariable = figma.variables.getVariableById(parameters['colGutterCenter'].variableID)

            mySelection.forEach(selectedObject => {
              if(selectedObject.type == "FRAME"){
                if('layoutGrids' in selectedObject){
                  let layoutGridCopy = clone(selectedObject.layoutGrids);
                  let gridLayoutTypeCounter = gridCounter(selectedObject);

                  if(gridLayoutTypeCounter.col == 0){                                    
                    layoutGridCopy.push({
                        alignment: "CENTER",
                        boundVariables: {
                          "count": {
                            "type": "VARIABLE_ALIAS",
                            "id": parameters['colCountCenter'].variableID
                          },
                          "sectionSize": {
                            "type": "VARIABLE_ALIAS",
                            "id": parameters['colWidthCenter'].variableID
                          },
                          "gutterSize": {
                            "type": "VARIABLE_ALIAS",
                            "id": parameters['colGutterCenter'].variableID
                          }
                        },
                        color: {r: 1, g: 0, b: 0, a: 0.10000000149011612},
                        count: parameters['colCountCenter'].value,
                        gutterSize: parameters['colGutterCenter'].value,
                        sectionSize: parameters['colWidthCenter'].value,
                        pattern: "COLUMNS",
                        visible: true
                      })
                  } else {
                    layoutGridCopy.forEach((gridItem: any, index: number) => {  
                      if(gridItem.pattern == 'COLUMNS'){ 
                        if(gridItem.alignment != "CENTER"){
                          let gridItemClone = clone(gridItem);
                          gridItemClone.alignment = "CENTER";
                          switch(gridItem.alignment){
                            case 'MIN':
                            case 'MAX':
                              delete gridItemClone.offset;
                              delete gridItemClone.boundVariables.offset;
                            break;
                            case 'STRETCH':
                              delete gridItemClone.offset;
                              delete gridItemClone.boundVariables.offset;
                              gridItemClone.sectionSize = parameters['colWidthCenter'].value;
                              gridItemClone.boundVariables.sectionSize = {"type": "VARIABLE_ALIAS", "id": parameters['colWidthCenter'].variableID};
                            break;
                          }
                          layoutGridCopy[index] = gridItemClone;
                        } else{
                          if(selectedGridColumnNumberVariable && selectedGridColumnGutterVariable && selectedGridColumnWidthVariable){
                            layoutGridCopy[index] = figma.variables.setBoundVariableForLayoutGrid(layoutGridCopy[index], 'count', selectedGridColumnNumberVariable)
                            layoutGridCopy[index] = figma.variables.setBoundVariableForLayoutGrid(layoutGridCopy[index], 'sectionSize', selectedGridColumnWidthVariable)
                            layoutGridCopy[index] = figma.variables.setBoundVariableForLayoutGrid(layoutGridCopy[index], 'gutterSize', selectedGridColumnGutterVariable)
                          }
                        } 
                      }
                    });
                  }
                  selectedObject.layoutGrids
                  selectedObject.layoutGrids = layoutGridCopy; 
                }
              }
            });
      break;
      case 'gridColumnStretch':
        let selectedGridColumnNumberStretchVariable = figma.variables.getVariableById(parameters['colCountStretch'].variableID),
            selectedGridColumnMarginStretchVariable = figma.variables.getVariableById(parameters['colMarginStretch'].variableID),
            selectedGridColumnGutterStretchVariable = figma.variables.getVariableById(parameters['colGutterStretch'].variableID)
            
            mySelection.forEach(selectedObject => {
              if(selectedObject.type == "FRAME"){
                if('layoutGrids' in selectedObject){
                  let layoutGridCopy = clone(selectedObject.layoutGrids);
                  let gridLayoutTypeCounter = gridCounter(selectedObject);
                  
                  if(gridLayoutTypeCounter.col == 0){  
                    layoutGridCopy.push({
                        alignment: "STRETCH",
                        boundVariables: {
                          "count": {
                            "type": "VARIABLE_ALIAS",
                            "id": parameters['colCountStretch'].variableID
                          },
                          "offset": {
                            "type": "VARIABLE_ALIAS",
                            "id": parameters['colMarginStretch'].variableID
                          },
                          "gutterSize": {
                            "type": "VARIABLE_ALIAS",
                            "id": parameters['colGutterStretch'].variableID
                          }
                        },
                        color: {r: 1, g: 0, b: 0, a: 0.10000000149011612},
                        count: parameters['colCountStretch'].value,
                        gutterSize: parameters['colGutterStretch'].value,
                        offset: parameters['colMarginStretch'].value,
                        pattern: "COLUMNS",
                        visible: true
                      })
                  } else {
                    layoutGridCopy.forEach((gridItem: any, index: number) => {
                      if(gridItem.pattern == 'COLUMNS'){
                        if(gridItem.alignment != "STRETCH"){
                        
                          let gridItemClone = clone(gridItem);
                          gridItemClone.alignment = "STRETCH";
                          switch(gridItem.alignment){
                            case 'MIN':
                            case 'MAX':
                              delete gridItemClone.sectionSize;
                              delete gridItemClone.boundVariables.sectionSize;
                            break;
                            case 'CENTER':
                              delete gridItemClone.sectionSize;
                              delete gridItemClone.boundVariables.sectionSize;
                              gridItemClone.offset = parameters['colMarginStretch'].value;
                              gridItemClone.boundVariables.offset = {"type": "VARIABLE_ALIAS", "id": parameters['colMarginStretch'].variableID};                            
                            break;
                          }
                          layoutGridCopy[index] = gridItemClone;                         
                        } else{
                          if(selectedGridColumnNumberStretchVariable && selectedGridColumnGutterStretchVariable && selectedGridColumnMarginStretchVariable){
                            layoutGridCopy[index].alignment = 'STRETCH';
                            layoutGridCopy[index] = figma.variables.setBoundVariableForLayoutGrid(layoutGridCopy[index], 'count', selectedGridColumnNumberStretchVariable)
                            layoutGridCopy[index] = figma.variables.setBoundVariableForLayoutGrid(layoutGridCopy[index], 'offset', selectedGridColumnMarginStretchVariable)
                            layoutGridCopy[index] = figma.variables.setBoundVariableForLayoutGrid(layoutGridCopy[index], 'gutterSize', selectedGridColumnGutterStretchVariable)
                          }
                        }
                      }
                    });
                  }
                  selectedObject.layoutGrids = layoutGridCopy; 
                }
              }
            });
      break;
      case 'gridColumnLeft':
        let selectedGridColumnNumberLeftVariable = figma.variables.getVariableById(parameters['colCountLeft'].variableID),
            selectedGridColumnWidthLeftVariable = figma.variables.getVariableById(parameters['colWidthLeft'].variableID),
            selectedGridColumnMarginLeftVariable = figma.variables.getVariableById(parameters['colMarginLeft'].variableID),
            selectedGridColumnGutterLeftVariable = figma.variables.getVariableById(parameters['colGutterLeft'].variableID)
            
            mySelection.forEach(selectedObject => {
              if(selectedObject.type == "FRAME"){
                if('layoutGrids' in selectedObject){
                  let layoutGridCopy = clone(selectedObject.layoutGrids);
                  let gridLayoutTypeCounter = gridCounter(selectedObject);
                  
                  if(gridLayoutTypeCounter.col == 0){  
                    layoutGridCopy.push({
                        alignment: "MIN",
                        boundVariables: {
                          "count": {
                            "type": "VARIABLE_ALIAS",
                            "id": parameters['colCountLeft'].variableID
                          },
                          "offset": {
                            "type": "VARIABLE_ALIAS",
                            "id": parameters['colMarginLeft'].variableID
                          },
                          "sectionSize": {
                            "type": "VARIABLE_ALIAS",
                            "id": parameters['colWidthLeft'].variableID
                          },
                          "gutterSize": {
                            "type": "VARIABLE_ALIAS",
                            "id": parameters['colGutterLeft'].variableID
                          }
                        },
                        color: {r: 1, g: 0, b: 0, a: 0.10000000149011612},
                        count: parameters['colCountLeft'].value,
                        gutterSize: parameters['colGutterLeft'].value,
                        offset: parameters['colMarginLeft'].value,
                        sectionSize: parameters['colWidthLeft'].value,
                        pattern: "COLUMNS",
                        visible: true
                      })
                  } else {
                    layoutGridCopy.forEach((gridItem: any, index: number) => {
                      if(gridItem.pattern == 'COLUMNS'){
                        if(gridItem.alignment != "MIN"){
                          let gridItemClone = clone(gridItem);
                          gridItemClone.alignment = "MIN";
                          
                          switch(gridItem.alignment){
                            case 'STRETCH':
                              gridItemClone.sectionSize = parameters['colWidthLeft'].value;
                              gridItemClone.boundVariables.sectionSize = {"type": "VARIABLE_ALIAS", "id": parameters['colWidthLeft'].variableID};
                            break;
                            case 'CENTER':
                              gridItemClone.offset = parameters['colMarginLeft'].value;
                              gridItemClone.boundVariables.offset = {"type": "VARIABLE_ALIAS", "id": parameters['colMarginLeft'].variableID};
                            break;
                          }
                          layoutGridCopy[index] = gridItemClone;
                        } else{                         
                          if(selectedGridColumnNumberLeftVariable && selectedGridColumnWidthLeftVariable && selectedGridColumnMarginLeftVariable && selectedGridColumnGutterLeftVariable){
                            layoutGridCopy[index].alignment = 'MIN';
                            layoutGridCopy[index] = figma.variables.setBoundVariableForLayoutGrid(layoutGridCopy[index], 'count', selectedGridColumnNumberLeftVariable)
                            layoutGridCopy[index] = figma.variables.setBoundVariableForLayoutGrid(layoutGridCopy[index], 'offset', selectedGridColumnMarginLeftVariable)
                            layoutGridCopy[index] = figma.variables.setBoundVariableForLayoutGrid(layoutGridCopy[index], 'gutterSize', selectedGridColumnGutterLeftVariable)
                            layoutGridCopy[index] = figma.variables.setBoundVariableForLayoutGrid(layoutGridCopy[index], 'sectionSize', selectedGridColumnWidthLeftVariable)
                          }
                        }
                      }
                    });
                  }
                  selectedObject.layoutGrids = layoutGridCopy; 
                }
              }
            });
      break;
      case 'gridColumnRight':
        let selectedGridColumnNumberRightVariable = figma.variables.getVariableById(parameters['colCountRight'].variableID),
            selectedGridColumnWidthRightVariable = figma.variables.getVariableById(parameters['colWidthRight'].variableID),
            selectedGridColumnMarginRightVariable = figma.variables.getVariableById(parameters['colMarginRight'].variableID),
            selectedGridColumnGutterRightVariable = figma.variables.getVariableById(parameters['colGutterRight'].variableID)
            
            mySelection.forEach(selectedObject => {
              if(selectedObject.type == "FRAME"){
                if('layoutGrids' in selectedObject){
                  let layoutGridCopy = clone(selectedObject.layoutGrids);
                  let gridLayoutTypeCounter = gridCounter(selectedObject);
                  
                  if(gridLayoutTypeCounter.col == 0){  
                    layoutGridCopy.push({
                        alignment: "MAX",
                        boundVariables: {
                          "count": {
                            "type": "VARIABLE_ALIAS",
                            "id": parameters['colCountRight'].variableID
                          },
                          "offset": {
                            "type": "VARIABLE_ALIAS",
                            "id": parameters['colMarginRight'].variableID
                          },
                          "sectionSize": {
                            "type": "VARIABLE_ALIAS",
                            "id": parameters['colWidthRight'].variableID
                          },
                          "gutterSize": {
                            "type": "VARIABLE_ALIAS",
                            "id": parameters['colGutterRight'].variableID
                          }
                        },
                        color: {r: 1, g: 0, b: 0, a: 0.10000000149011612},
                        count: parameters['colCountRight'].value,
                        gutterSize: parameters['colGutterRight'].value,
                        offset: parameters['colMarginRight'].value,
                        sectionSize: parameters['colWidthRight'].value,
                        pattern: "COLUMNS",
                        visible: true
                      })
                  } else {
                    layoutGridCopy.forEach((gridItem: any, index: number) => {
                      if(gridItem.pattern == 'COLUMNS'){
                        if(gridItem.alignment != "MAX"){
                          
                          let gridItemClone = clone(gridItem);
                          gridItemClone.alignment = "MAX";
                          
                          switch(gridItem.alignment){
                            case 'STRETCH':
                              gridItemClone.sectionSize = parameters['colWidthRight'].value;
                              gridItemClone.boundVariables.sectionSize = {"type": "VARIABLE_ALIAS", "id": parameters['colWidthRight'].variableID};
                            break;
                            case 'CENTER':
                              gridItemClone.offset = parameters['colMarginRight'].value;
                              gridItemClone.boundVariables.offset = {"type": "VARIABLE_ALIAS", "id": parameters['colMarginRight'].variableID};
                            break;
                          }
                          layoutGridCopy[index] = gridItemClone;
                        } else{
                          if(selectedGridColumnNumberRightVariable && selectedGridColumnWidthRightVariable && selectedGridColumnMarginRightVariable && selectedGridColumnGutterRightVariable){
                            layoutGridCopy[index].alignment = 'MAX';
                            layoutGridCopy[index] = figma.variables.setBoundVariableForLayoutGrid(layoutGridCopy[index], 'count', selectedGridColumnNumberRightVariable)
                            layoutGridCopy[index] = figma.variables.setBoundVariableForLayoutGrid(layoutGridCopy[index], 'offset', selectedGridColumnMarginRightVariable)
                            layoutGridCopy[index] = figma.variables.setBoundVariableForLayoutGrid(layoutGridCopy[index], 'gutterSize', selectedGridColumnGutterRightVariable)
                            layoutGridCopy[index] = figma.variables.setBoundVariableForLayoutGrid(layoutGridCopy[index], 'sectionSize', selectedGridColumnWidthRightVariable)
                          }
                        }
                      }
                    });
                  }
                  selectedObject.layoutGrids = layoutGridCopy; 
                }
              } else {
                figma.notify('Please select a frame')
              }
            });
      break;
      case 'gridRowCenter':
        let selectedGridRowNumberVariable = figma.variables.getVariableById(parameters['rowCountCenter'].variableID),
            selectedGridRowWidthVariable = figma.variables.getVariableById(parameters['rowWidthCenter'].variableID),
            selectedGridRowGutterVariable = figma.variables.getVariableById(parameters['rowGutterCenter'].variableID)

            mySelection.forEach(selectedObject => {
              if(selectedObject.type == "FRAME"){
                if('layoutGrids' in selectedObject){
                  let layoutGridCopy = clone(selectedObject.layoutGrids);
                  let gridLayoutTypeCounter = gridCounter(selectedObject);

                  if(gridLayoutTypeCounter.row == 0){                                    
                    layoutGridCopy.push({
                        alignment: "CENTER",
                        boundVariables: {
                          "count": {
                            "type": "VARIABLE_ALIAS",
                            "id": parameters['rowCountCenter'].variableID
                          },
                          "sectionSize": {
                            "type": "VARIABLE_ALIAS",
                            "id": parameters['rowWidthCenter'].variableID
                          },
                          "gutterSize": {
                            "type": "VARIABLE_ALIAS",
                            "id": parameters['rowGutterCenter'].variableID
                          }
                        },
                        color: {r: 1, g: 0, b: 0, a: 0.10000000149011612},
                        count: parameters['rowCountCenter'].value,
                        gutterSize: parameters['rowGutterCenter'].value,
                        sectionSize: parameters['rowWidthCenter'].value,
                        pattern: "ROWS",
                        visible: true
                      })
                  } else {
                    layoutGridCopy.forEach((gridItem: any, index: number) => {  
                      if(gridItem.pattern == 'ROWS'){ 
                        if(gridItem.alignment != "CENTER"){
                          let gridItemClone = clone(gridItem);
                          gridItemClone.alignment = "CENTER";
                          switch(gridItem.alignment){
                            case 'MIN':
                            case 'MAX':
                              delete gridItemClone.offset;
                              delete gridItemClone.boundVariables.offset;
                            break;
                            case 'STRETCH':
                              delete gridItemClone.offset;
                              delete gridItemClone.boundVariables.offset;
                              gridItemClone.sectionSize = parameters['rowWidthCenter'].value;
                              gridItemClone.boundVariables.sectionSize = {"type": "VARIABLE_ALIAS", "id": parameters['rowWidthCenter'].variableID};
                            break;
                          }
                          layoutGridCopy[index] = gridItemClone;
                        } else{
                          if(selectedGridRowNumberVariable && selectedGridRowGutterVariable && selectedGridRowWidthVariable){
                            layoutGridCopy[index] = figma.variables.setBoundVariableForLayoutGrid(layoutGridCopy[index], 'count', selectedGridRowNumberVariable)
                            layoutGridCopy[index] = figma.variables.setBoundVariableForLayoutGrid(layoutGridCopy[index], 'sectionSize', selectedGridRowWidthVariable)
                            layoutGridCopy[index] = figma.variables.setBoundVariableForLayoutGrid(layoutGridCopy[index], 'gutterSize', selectedGridRowGutterVariable)
                          }
                        } 
                      }
                    });
                  }
                  selectedObject.layoutGrids
                  selectedObject.layoutGrids = layoutGridCopy; 
                }
              }
            });
      break;
      case 'gridRowStretch':
        let selectedGridRowNumberStretchVariable = figma.variables.getVariableById(parameters['rowCountStretch'].variableID),
            selectedGridRowMarginStretchVariable = figma.variables.getVariableById(parameters['rowMarginStretch'].variableID),
            selectedGridRowGutterStretchVariable = figma.variables.getVariableById(parameters['rowGutterStretch'].variableID)
            
            mySelection.forEach(selectedObject => {
              if(selectedObject.type == "FRAME"){
                if('layoutGrids' in selectedObject){
                  let layoutGridCopy = clone(selectedObject.layoutGrids);
                  let gridLayoutTypeCounter = gridCounter(selectedObject);
                  
                  if(gridLayoutTypeCounter.row == 0){  
                    layoutGridCopy.push({
                        alignment: "STRETCH",
                        boundVariables: {
                          "count": {
                            "type": "VARIABLE_ALIAS",
                            "id": parameters['rowCountStretch'].variableID
                          },
                          "offset": {
                            "type": "VARIABLE_ALIAS",
                            "id": parameters['rowMarginStretch'].variableID
                          },
                          "gutterSize": {
                            "type": "VARIABLE_ALIAS",
                            "id": parameters['rowGutterStretch'].variableID
                          }
                        },
                        color: {r: 1, g: 0, b: 0, a: 0.10000000149011612},
                        count: parameters['rowCountStretch'].value,
                        gutterSize: parameters['rowGutterStretch'].value,
                        offset: parameters['rowMarginStretch'].value,
                        pattern: "ROWS",
                        visible: true
                      })
                  } else {
                    layoutGridCopy.forEach((gridItem: any, index: number) => {
                      if(gridItem.pattern == 'ROWS'){
                        if(gridItem.alignment != "STRETCH"){
                        
                          let gridItemClone = clone(gridItem);
                          gridItemClone.alignment = "STRETCH";
                          switch(gridItem.alignment){
                            case 'MIN':
                            case 'MAX':
                              delete gridItemClone.sectionSize;
                              delete gridItemClone.boundVariables.sectionSize;
                            break;
                            case 'CENTER':
                              delete gridItemClone.sectionSize;
                              delete gridItemClone.boundVariables.sectionSize;
                              gridItemClone.offset = parameters['rowMarginStretch'].value;
                              gridItemClone.boundVariables.offset = {"type": "VARIABLE_ALIAS", "id": parameters['rowMarginStretch'].variableID};                            
                            break;
                          }
                          layoutGridCopy[index] = gridItemClone;                         
                        } else{
                          if(selectedGridRowNumberStretchVariable && selectedGridRowGutterStretchVariable && selectedGridRowMarginStretchVariable){
                            layoutGridCopy[index].alignment = 'STRETCH';
                            layoutGridCopy[index] = figma.variables.setBoundVariableForLayoutGrid(layoutGridCopy[index], 'count', selectedGridRowNumberStretchVariable)
                            layoutGridCopy[index] = figma.variables.setBoundVariableForLayoutGrid(layoutGridCopy[index], 'offset', selectedGridRowMarginStretchVariable)
                            layoutGridCopy[index] = figma.variables.setBoundVariableForLayoutGrid(layoutGridCopy[index], 'gutterSize', selectedGridRowGutterStretchVariable)
                          }
                        }
                      }
                    });
                  }
                  selectedObject.layoutGrids = layoutGridCopy; 
                }
              }
            });
      break;
      case 'gridRowTop':
        let selectedGridRowNumberTopVariable = figma.variables.getVariableById(parameters['rowCountTop'].variableID),
            selectedGridRowWidthTopVariable = figma.variables.getVariableById(parameters['rowWidthTop'].variableID),
            selectedGridRowMarginTopVariable = figma.variables.getVariableById(parameters['rowMarginTop'].variableID),
            selectedGridRowGutterTopVariable = figma.variables.getVariableById(parameters['rowGutterTop'].variableID)
            
            mySelection.forEach(selectedObject => {
              if(selectedObject.type == "FRAME"){
                if('layoutGrids' in selectedObject){
                  let layoutGridCopy = clone(selectedObject.layoutGrids);
                  let gridLayoutTypeCounter = gridCounter(selectedObject);
                  
                  if(gridLayoutTypeCounter.row == 0){  
                    layoutGridCopy.push({
                        alignment: "MIN",
                        boundVariables: {
                          "count": {
                            "type": "VARIABLE_ALIAS",
                            "id": parameters['rowCountTop'].variableID
                          },
                          "offset": {
                            "type": "VARIABLE_ALIAS",
                            "id": parameters['rowMarginTop'].variableID
                          },
                          "sectionSize": {
                            "type": "VARIABLE_ALIAS",
                            "id": parameters['rowWidthTop'].variableID
                          },
                          "gutterSize": {
                            "type": "VARIABLE_ALIAS",
                            "id": parameters['rowGutterTop'].variableID
                          }
                        },
                        color: {r: 1, g: 0, b: 0, a: 0.10000000149011612},
                        count: parameters['rowCountTop'].value,
                        gutterSize: parameters['rowGutterTop'].value,
                        offset: parameters['rowMarginTop'].value,
                        sectionSize: parameters['rowWidthTop'].value,
                        pattern: "ROWS",
                        visible: true
                      })
                  } else {
                    layoutGridCopy.forEach((gridItem: any, index: number) => {
                      if(gridItem.pattern == 'ROWS'){
                        if(gridItem.alignment != "MIN"){
                          let gridItemClone = clone(gridItem);
                          gridItemClone.alignment = "MIN";
                          
                          switch(gridItem.alignment){
                            case 'STRETCH':
                              gridItemClone.sectionSize = parameters['rowWidthTop'].value;
                              gridItemClone.boundVariables.sectionSize = {"type": "VARIABLE_ALIAS", "id": parameters['rowWidthTop'].variableID};
                            break;
                            case 'CENTER':
                              gridItemClone.offset = parameters['rowMarginTop'].value;
                              gridItemClone.boundVariables.offset = {"type": "VARIABLE_ALIAS", "id": parameters['rowMarginTop'].variableID};
                            break;
                          }
                          layoutGridCopy[index] = gridItemClone;
                        } else{                         
                          if(selectedGridRowNumberTopVariable && selectedGridRowWidthTopVariable && selectedGridRowMarginTopVariable && selectedGridRowGutterTopVariable){
                            layoutGridCopy[index].alignment = 'MIN';
                            layoutGridCopy[index] = figma.variables.setBoundVariableForLayoutGrid(layoutGridCopy[index], 'count', selectedGridRowNumberTopVariable)
                            layoutGridCopy[index] = figma.variables.setBoundVariableForLayoutGrid(layoutGridCopy[index], 'offset', selectedGridRowMarginTopVariable)
                            layoutGridCopy[index] = figma.variables.setBoundVariableForLayoutGrid(layoutGridCopy[index], 'gutterSize', selectedGridRowGutterTopVariable)
                            layoutGridCopy[index] = figma.variables.setBoundVariableForLayoutGrid(layoutGridCopy[index], 'sectionSize', selectedGridRowWidthTopVariable)
                          }
                        }
                      }
                    });
                  }
                  selectedObject.layoutGrids = layoutGridCopy; 
                }
              }
            });
      break;
      case 'gridRowBottom':
        let selectedGridRowNumberBottomVariable = figma.variables.getVariableById(parameters['rowCountBottom'].variableID),
            selectedGridRowWidthBottomVariable = figma.variables.getVariableById(parameters['rowWidthBottom'].variableID),
            selectedGridRowMarginBottomVariable = figma.variables.getVariableById(parameters['rowMarginBottom'].variableID),
            selectedGridRowGutterBottomVariable = figma.variables.getVariableById(parameters['rowGutterBottom'].variableID)
            
            mySelection.forEach(selectedObject => {
              if(selectedObject.type == "FRAME"){
                if('layoutGrids' in selectedObject){
                  let layoutGridCopy = clone(selectedObject.layoutGrids);
                  let gridLayoutTypeCounter = gridCounter(selectedObject);
                  
                  if(gridLayoutTypeCounter.row == 0){  
                    layoutGridCopy.push({
                        alignment: "MAX",
                        boundVariables: {
                          "count": {
                            "type": "VARIABLE_ALIAS",
                            "id": parameters['rowCountBottom'].variableID
                          },
                          "offset": {
                            "type": "VARIABLE_ALIAS",
                            "id": parameters['rowMarginBottom'].variableID
                          },
                          "sectionSize": {
                            "type": "VARIABLE_ALIAS",
                            "id": parameters['rowWidthBottom'].variableID
                          },
                          "gutterSize": {
                            "type": "VARIABLE_ALIAS",
                            "id": parameters['rowGutterBottom'].variableID
                          }
                        },
                        color: {r: 1, g: 0, b: 0, a: 0.10000000149011612},
                        count: parameters['rowCountBottom'].value,
                        gutterSize: parameters['rowGutterBottom'].value,
                        offset: parameters['rowMarginBottom'].value,
                        sectionSize: parameters['rowWidthBottom'].value,
                        pattern: "ROWS",
                        visible: true
                      })
                  } else {
                    layoutGridCopy.forEach((gridItem: any, index: number) => {
                      if(gridItem.pattern == 'ROWS'){
                        if(gridItem.alignment != "MAX"){
                          
                          let gridItemClone = clone(gridItem);
                          gridItemClone.alignment = "MAX";
                          
                          switch(gridItem.alignment){
                            case 'STRETCH':
                              gridItemClone.sectionSize = parameters['rowWidthBottom'].value;
                              gridItemClone.boundVariables.sectionSize = {"type": "VARIABLE_ALIAS", "id": parameters['rowWidthBottom'].variableID};
                            break;
                            case 'CENTER':
                              gridItemClone.offset = parameters['rowMarginBottom'].value;
                              gridItemClone.boundVariables.offset = {"type": "VARIABLE_ALIAS", "id": parameters['rowMarginBottom'].variableID};
                            break;
                          }
                          layoutGridCopy[index] = gridItemClone;
                        } else{
                          if(selectedGridRowNumberBottomVariable && selectedGridRowWidthBottomVariable && selectedGridRowMarginBottomVariable && selectedGridRowGutterBottomVariable){
                            layoutGridCopy[index].alignment = 'MAX';
                            layoutGridCopy[index] = figma.variables.setBoundVariableForLayoutGrid(layoutGridCopy[index], 'count', selectedGridRowNumberBottomVariable)
                            layoutGridCopy[index] = figma.variables.setBoundVariableForLayoutGrid(layoutGridCopy[index], 'offset', selectedGridRowMarginBottomVariable)
                            layoutGridCopy[index] = figma.variables.setBoundVariableForLayoutGrid(layoutGridCopy[index], 'gutterSize', selectedGridRowGutterBottomVariable)
                            layoutGridCopy[index] = figma.variables.setBoundVariableForLayoutGrid(layoutGridCopy[index], 'sectionSize', selectedGridRowWidthBottomVariable)
                          }
                        }
                      }
                    });
                  }
                  selectedObject.layoutGrids = layoutGridCopy; 
                }
              } else {
                figma.notify('Please select a frame')
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

function effectsCounter(currentItem: any){  
  let dropShadowCounter = 0,
      layerBlurCounter = 0,
      backgroundBlurCounter = 0,
      innerShadowCounter = 0;

  currentItem.effects.forEach((effect: any) => {
    switch(effect.type){
      case 'DROP_SHADOW':
        dropShadowCounter++;
      break;

      case 'LAYER_BLUR':
        layerBlurCounter++;
      break;

      case 'BACKGROUND_BLUR':
        backgroundBlurCounter++;
      break;

      case 'INNER_SHADOW':
        innerShadowCounter++;
      break;
    }
  });
  let globalCounter = {
    dropShadow: dropShadowCounter,
    layerBlur: layerBlurCounter,
    backgroundBlur: backgroundBlurCounter,
    innerShadow: innerShadowCounter
  }
  return globalCounter;
}

function gridCounter(currentItem: any){
  let gridCounter = 0,
      rowCounter = 0,
      colCounter = 0;

  currentItem.layoutGrids.forEach((gridCounterItem: any) => {
    switch(gridCounterItem.pattern){
      case 'GRID':
        gridCounter++;
      break;

      case 'ROWS':
        rowCounter++;
      break;

      case 'COLUMNS':
        colCounter++;
      break;

    }
  });
  let globalCounter = {
    grid: gridCounter,
    row: rowCounter,
    col: colCounter,
  }  
  return globalCounter;
}
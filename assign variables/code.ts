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
                searchValue: colorName + ' --> ' + colorCollectionName 
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
                searchValue: colorNameImported + ' --> ' + colorCollectionNameImported
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
      case 'paddingSize':
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
              searchValue: floatValue + 'px --> (var--' + floatName + ') / ' + floatCollectionName
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
              searchValue: floatValueImported + 'px --> (var--' + floatNameImported + ') / ' + floatCollectionNameImported + ')' 
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
          switch(key){
            case 'border_width':
              const suggestionsFloatBorder = floatObjects
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
                      searchValue: floatValue + 'px --> (var--' + floatName + ') / ' + floatCollectionName
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
                      searchValue: floatValue + 'px --> (var--' + floatName + ') / ' + floatCollectionName + ')'
                    })
                  }
                break;
                case "radius":
                  if(float.scopes.toString().includes('CORNER_RADIUS') || float.scopes.toString().includes('ALL_SCOPES')){
                    floatObjects.push({
                      name: floatName,
                      value: floatValue,
                      id: floatVariableId,
                      collectionName: floatCollectionName,
                      collectionId: floatCollectionId,
                      location: 'Local',
                      searchValue: floatValue + 'px --> (var--' + floatName + ') / ' + floatCollectionName
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
                      searchValue: floatValue + '% --> (var--' + floatName + ') / ' + floatCollectionName
                    })
                  }
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
                    searchValue: floatValueImported + 'px --> (var--' + floatNameImported + ') / ' + floatCollectionNameImported
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
                    searchValue: floatValueImported + 'px --> (var--' + floatNameImported + ') / ' + floatCollectionNameImported
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
                    searchValue: floatValueImported + 'px --> (var--' + floatNameImported + ') / ' + floatCollectionNameImported
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
                    searchValue: floatValueImported + '% --> (var--' + floatNameImported + ') / ' + floatCollectionNameImported
                  })
                }
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
                              <rect width="${s.paddingWidth}" height="${s.paddingHeight}" x="${s.paddingPositionX}" y="${s.paddingPositionY}" rx="1" fill="#0D99FF"/>
                              <rect width="${s.paddingWidthSecond}" height="${s.paddingHeightSecond}" x="${s.paddingPositionXSecond}" y="${s.paddingPositionYSecond}" visibility="${s.visibilitySecond}" rx="1" fill="#0D99FF"/>
                            </svg>`,
                    data: {
                      value: s.devValue,
                    }
                  });
              });
            
        result.setSuggestions(suggestionsPaddingPosition);
      break;

      case 'border_position':
        const sizeFixeBorder = 16,
              littleSizeBorder = 4,
              bigSizeBorder = 14,
              littlePositionBorder = 1,
              bigPositionBorder = 11;
        let borderPositionArray: any[] = [{
          searchValue: 'All',
          devValue: ['strokeTopWeight', 'strokeBottomWeight', 'strokeRightWeight' , 'strokeLeftWeight'],
          paddingWidth: bigSizeBorder,
          paddingHeight: littleSizeBorder,
          paddingPositionX: littlePositionBorder,
          paddingPositionY: littlePositionBorder,
          paddingWidthSecond: bigSizeBorder,
          paddingHeightSecond: littleSizeBorder,
          paddingPositionXSecond: littlePositionBorder,
          paddingPositionYSecond: bigPositionBorder,
          visibilitySecond: "visible"
        },{
          searchValue: 'Top & bottom',
          devValue: ['strokeTopWeight', 'strokeBottomWeight'],
          paddingWidth: bigSizeBorder,
          paddingHeight: littleSizeBorder,
          paddingPositionX: littlePositionBorder,
          paddingPositionY: littlePositionBorder,
          paddingWidthSecond: bigSizeBorder,
          paddingHeightSecond: littleSizeBorder,
          paddingPositionXSecond: littlePositionBorder,
          paddingPositionYSecond: bigPositionBorder,
          visibilitySecond: "visible"
        },
        {
          searchValue: 'Left & Right',
          devValue: ['strokeLeftWeight', 'strokeRightWeight'],
          paddingWidth: littleSizeBorder,
          paddingHeight: bigSizeBorder,
          paddingPositionX: littlePositionBorder,
          paddingPositionY: littlePositionBorder,
          paddingWidthSecond: littleSizeBorder,
          paddingHeightSecond: bigSizeBorder,
          paddingPositionXSecond: bigPositionBorder,
          paddingPositionYSecond: littlePositionBorder,
          visibilitySecond: "visible"
        },
        {
          searchValue: 'Top',
          devValue: ['strokeTopWeight'],
          paddingWidth: bigSizeBorder,
          paddingHeight: littleSizeBorder,
          paddingPositionX: littlePositionBorder,
          paddingPositionY: littlePositionBorder,
          paddingWidthSecond: bigSizeBorder,
          paddingHeightSecond: littleSizeBorder,
          paddingPositionXSecond: littlePositionBorder,
          paddingPositionYSecond: bigPositionBorder,
          visibilitySecond: "hidden"
        },
        {
          searchValue: 'Bottom',
          devValue: ['strokeBottomWeight'],
          paddingWidth: bigSizeBorder,
          paddingHeight: littleSizeBorder,
          paddingPositionX: littlePositionBorder,
          paddingPositionY: bigPositionBorder,
          paddingWidthSecond: bigSizeBorder,
          paddingHeightSecond: littleSizeBorder,
          paddingPositionXSecond: littlePositionBorder,
          paddingPositionYSecond: bigPositionBorder,
          visibilitySecond: "hidden"
        },
        {
          searchValue: 'Left',
          devValue: ['strokeLeftWeight'],
          paddingWidth: littleSizeBorder,
          paddingHeight: bigSizeBorder,
          paddingPositionX: littlePositionBorder,
          paddingPositionY: littlePositionBorder,
          paddingWidthSecond: bigSizeBorder,
          paddingHeightSecond: littleSizeBorder,
          paddingPositionXSecond: littlePositionBorder,
          paddingPositionYSecond: bigPositionBorder,
          visibilitySecond: "hidden"
        },
        {
          searchValue: 'Right',
          devValue: ['strokeRightWeight'],
          paddingWidth: littleSizeBorder,
          paddingHeight: bigSizeBorder,
          paddingPositionX: bigPositionBorder,
          paddingPositionY: littlePositionBorder,
          paddingWidthSecond: bigSizeBorder,
          paddingHeightSecond: littleSizeBorder,
          paddingPositionXSecond: littlePositionBorder,
          paddingPositionYSecond: bigPositionBorder,
          visibilitySecond: "hidden"
        }];        

        const suggestionsBorderPosition = borderPositionArray
            .filter(s => s.searchValue.includes(query))
            .map((s) => {                  
                  return ({
                    name: s.searchValue, 
                    icon: `<svg width="${sizeFixeBorder}" height="${sizeFixeBorder}" viewBox="0 0 ${sizeFixeBorder} ${sizeFixeBorder}" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="${sizeFixeBorder}" height="${sizeFixeBorder}" fill="#ffffff" x="0" y="0"/>
                              <rect width="${s.borderWidth}" height="${s.borderHeight}" x="${s.borderPositionX}" y="${s.borderPositionY}" rx="1" fill="#0D99FF"/>
                              <rect width="${s.borderWidthSecond}" height="${s.borderHeightSecond}" x="${s.borderPositionXSecond}" y="${s.borderPositionYSecond}" visibility="${s.visibilitySecond}" rx="1" fill="#0D99FF"/>
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
            searchValue: textString + ' --> var(--' + textName + ')  / ' + textCollectionName 
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
              searchValue: textStringImported + ' --> var(--' + textNameImported + ')  / ' + textCollectionNameImported 
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
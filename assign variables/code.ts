figma.parameters.on('input', ({query, result, key, parameters}) =>{

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
      // let collectionModes = collection.modes;
      // let collectionModesLength = collectionModes.length;

      //Variables Loop
      for (let variableIdsCount = 0; variableIdsCount < collectionVariablesIdsLength; variableIdsCount++) {
        let variableIdsString = collectionVariablesIds[variableIdsCount];
        let variableObjet = figma.variables.getVariableById(`${variableIdsString}`);
        let getColor = variableObjet?.name;
        let getValueMode = variableObjet?.valuesByMode;
        let getResolveType = variableObjet?.resolvedType;

        if(getResolveType == 'COLOR' && getColor !== undefined) {
          //Push the color name to the array
          if(getValueMode){
            let firstModeValue = getValueMode[Object.keys(getValueMode)[0]] as RGBA;

            colorNames.push(getColor);
            dataNames.push(rgbaToHex(firstModeValue))
          }
        }
      }
    }
    result.setSuggestions(colorNames.filter(s => s.includes(query)))

    //@KHE
    // result.setSuggestions([
    //   { name: 'NOM', icon: `data:image/svg+xml;base64,${iconBase64}` },
    // ]);

})

figma.on('run', ({ command, parameters }: RunEvent) => {
  // Votre code à exécuter lorsque l'événement "run" est déclenché
  console.log(`Commande: ${command}`);
  console.log(`Paramètres: ${parameters}`);

  figma.closePlugin()
});

// Functions
function rgbaToHex(color: RGBA): string {
  const r = (Math.round(color.r * 255).toString(16).length === 1 ? '0' : '') + Math.round(color.r * 255).toString(16);
  const g = (Math.round(color.g * 255).toString(16).length === 1 ? '0' : '') + Math.round(color.g * 255).toString(16);
  const b = (Math.round(color.b * 255).toString(16).length === 1 ? '0' : '') + Math.round(color.b * 255).toString(16);
  return `#${r}${g}${b}`;
}
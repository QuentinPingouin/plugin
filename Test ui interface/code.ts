figma.showUI(__html__);

// var variableColors = figma.variables.getLocalVariables("COLOR");
// var variableColorsLength = variableColors.length; 

// console.log(variableColorsLength);
// for(let colorNumber = 0; colorNumber < variableColorsLength; colorNumber++) {
//   //console.log(variableColors[colorNumber].name);

//  // for(let values = 0; values < variableColorsLength; values++) {
//  //   console.log(variableColors[colorNumber].valuesByMode['3:' + values]);
//  // }
//   console.log('----');

//   if(variableColors[colorNumber].name == 'Primary') {
//     console.log("Oui c'est bien la couleur ----> " + variableColors[colorNumber].name);
//   } else {
//     console.log('Non, la couleurs est -> ' + variableColors[colorNumber].name);
//   }
// }

// figma.ui.onmessage = msg => {
//   if (msg.type === 'keydown') {
//     const event = msg.event;

//     // Vérifiez si la touche Ctrl (ou Command sur Mac) est enfoncée en même temps que la touche J
//     if ((event.ctrlKey || event.metaKey) && event.key === 'j') {
//       // Le raccourci Ctrl+J a été enclenché, vous pouvez exécuter votre code ici
//       console.log('Raccourci clavier Ctrl+J détecté !');

//       // Exécutez l'action souhaitée en réponse au raccourci clavier
//       // Par exemple, vous pouvez remplir une forme en rouge, comme mentionné précédemment.
//     }
//   }

//   if (msg.type === 'apply-color') {
//     // Le code pour changer la couleur ici
//     const selection = figma.currentPage.selection;

//     if (selection.length > 0) {
//       const color = { r: 1, g: 0, b: 0 }; // Remplacez par la couleur de votre choix (ici, rouge)

//       for (const node of selection) {
//         if (node.type === 'RECTANGLE' || node.type === 'ELLIPSE') {
//           const fillStyle: SolidPaint = {
//             type: 'SOLID',
//             color: color,
//           };

//           node.fills = [fillStyle];
//         }
//       }

//       figma.notify("Couleur de remplissage mise à jour en rouge");
//     } else {
//       figma.notify("Sélectionnez un objet pour appliquer la couleur.");
//     }
//   }
  //   const colorsNames = [];
  //   //Boucle qui récupère les noms des couleurs
  //   for(let colorNumber = 0; colorNumber < variableColorsLength; colorNumber++) {
  //     // Ajouter le noms des couleurs à la liste
  //     colorsNames.push(variableColors[colorNumber].name.toLowerCase());
  //   }

  //   //Affiche les résultat dans la liste sur figma
  //   result.setSuggestions(colorsNames.filter(s => s.includes(query)))
  // } else if(key == 'mode'){
  //   const colorsMode = [];
  //   //Boucle qui récupère les noms des couleurs
  //   for(let colorNumber = 0; colorNumber < variableColorsLength; colorNumber++) {
  //     // Ajouter le noms des couleurs à la liste
  //     const variableCollection = variableColors[colorNumber].variableCollectionI;
  //     const variableValue = variableColors[colorNumber].valuesByMode;
  //     // for(const mode in variableValue) {
  //     //   if(variableValue.hasOwnProperty(mode)){
  //     //     // const variableModes = figma.variables.getVariableCollectionById(`${variableCollection}`).modes[mode].modeId; 
  //     //     console.log(figma.variables.getVariableCollectionById(`${variableCollection}`).modes[mode].modeId);
  //     //   }
        
  //     // }
  //     console.log(variableCollection);
  //     debugger;
  //     colorsMode.push(variableColors[colorNumber].name.toLowerCase());
  //   }

  //   //Affiche les résultat dans la liste sur figma
  //   result.setSuggestions(colorsMode.filter(s => s.includes(query)))

//   figma.closePlugin();
// };


figma.showUI(__html__);

// Envoyez un message pour activer le gestionnaire d'événements de raccourcis clavier
figma.ui.postMessage({ type: 'enable-shortcuts' });

// Définissez le gestionnaire d'événements pour les messages reçus du plugin
figma.ui.onmessage = (message) => {
  if (message.type === 'enable-shortcuts') {
    // L'interface utilisateur est prête à accepter des raccourcis clavier
    if (message.type === 'keydown') {
          const event = message.event;
      
          // Vérifiez si la touche Ctrl (ou Command sur Mac) est enfoncée en même temps que la touche J
          if ((event.ctrlKey || event.metaKey) && event.key === 'j') {
            // Le raccourci Ctrl+J a été enclenché, vous pouvez exécuter votre code ici
            console.log('Raccourci clavier Ctrl+J détecté !');
      
            // Exécutez l'action souhaitée en réponse au raccourci clavier
            // Par exemple, vous pouvez remplir une forme en rouge, comme mentionné précédemment.
          }
        };
    console.log('Raccourci clavier Ctrl+J détecté !');
  }
};

figma.on('run', () => {
  console.log('ducon');
  figma.currentPage
})
figma.parameters.on('input', ({query, result, key, parameters}) =>{
  console.log('test')
})

figma.on('run', ({ command, parameters }: RunEvent) => {
  // Votre code à exécuter lorsque l'événement "run" est déclenché
  console.log(`Commande: ${command}`);
  console.log(`Paramètres: ${parameters}`);

  figma.closePlugin()
});


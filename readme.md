# Installation
1. Téléchargez le code du projet
2. Double-cliquez sur le fichier index.html situé à la racine

# Utilisation
## Charger une matrice croisée de compétences
1. Cliquez sur le bouton "Charger une matrice croisée"
2. Sélectionnez le fichier Excel (.xlsx) contenant la matrice de compétences à traiter.

Les compétences peuvent alors être affichées par UE ou par module. Dans ce dernier cas, les modules n'ayant aucune compétence associée appraîtront en rouge.

## Format de la matrice croisée
Le fichier importé doitrespecter le format de la matrice fournie `/templates/templace-matrice-competences.xlsx`.

Les éléments suivants peuvent évoluer :
- Le nombre d'onglets correspondant aux blocs de compétences
- Le nombre de compétences par onglet
- Le nombre d'UE par année
- Le nombre de modules par UE

Les éléments suivants doivent être respectés :
- Le titre du document est situé en B2
- Les compétences commencent en D6
- Les UE commencent en B7
- Les modules commencent en C7

## Générer les fiches UE
1. Cliquez sur le bouton "Générer les fiches UE".
2. Sélectionnez le fichier Word (.docx) contenant le modèle de fiche UE à compléter. Le modèle par défaut se trouve dans le dossier `/templates/template-fiche-ue-2022-v1.docx`.
3. Une archive .zip regroupant toutes le fiches UE sera téléchargée à la fin du traitement (dans votre dossier `/téléchargements`).
Le projet draughts-game est développé en utilisant du nodeJs. En effet, nous utilisons le framework express et 
egalement Bcrypte pour le hashage des mots de passes. 
L'architecture du projet est basée sur le modele MVC (Modele Vue Controlleur), en effet 
dans le modèle nous avons touts les scripsts permettant d'attaquer à la BD, pour le dossier Routes nous avons les acces en fonction de l'url 
dans le navigateur de l'utilisateur, en ce qui concerne le controlleur c'est dans cette partie que sont écrits tous les programmes liés
au traitement des données.
Nous rajoutons un dossier Config dans lequel toutes les configuratons liées à la bD sont ecrits.
le pont d'entré de l'appli est le fichier app.js. On peut bien le lancer en fesant node app.js mais nous l'avons automatisé 
par le package nodemoon.
En ce qui concerne les dependances elles sont consignés dans le fichier package.json.

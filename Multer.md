# Comprendre Multer dans notre architecture Node.js

Dans le cadre de notre projet de conversion de CV (Flexso → Europass), nous utilisons **Multer**. Voici une explication de son rôle, de son fonctionnement et de son importance dans notre stack technique.

## 1. Qu'est-ce que Multer ?
**Multer** est un "middleware" (un composant intermédiaire) pour Express, conçu spécifiquement pour gérer l'upload de fichiers. En Node.js, lorsqu'un client (comme une application Fiori) envoie un fichier à un serveur, les données arrivent sous un format complexe appelé `multipart/form-data`.

Par défaut, Express est incapable de lire ce format. Multer intervient pour intercepter la requête, extraire le fichier, et le rendre exploitable dans notre code via l'objet `req.file`.

## 2. Pourquoi l'utiliser pour notre POC ?
Dans notre workflow, l'utilisateur soumet un document `.docx`. Multer gère les trois étapes critiques de cette réception :
1. **La Réception** : Il traite le flux binaire du fichier qui arrive sur le serveur.
2. **Le Stockage Temporaire** : Il enregistre le fichier dans un dossier local (dans notre cas, le dossier `uploads/` du conteneur Docker).
3. **La Mise à disposition** : Il fournit à notre logique TypeScript le chemin d'accès (`path`) du fichier sur le disque.

Sans Multer, nous devrions écrire manuellement des centaines de lignes de code pour reconstruire le fichier à partir des paquets de données reçus.

## 3. Fonctionnement Technique
Dans notre fichier `src/index.ts`, nous configurons Multer ainsi :
* **Destination** : Nous définissons `uploads/` comme zone de transit.
* **Sécurité** : Il nous permet de limiter la taille des fichiers ou de filtrer les extensions (ex: accepter uniquement les `.docx`).



Une fois que Multer a fini son travail, nous récupérons le chemin du fichier, nous le passons à **LibreOffice** pour la conversion, puis nous supprimons le fichier temporaire (`fs.unlinkSync`) pour ne pas encombrer la mémoire du serveur sur SAP BTP.

## 4. Conclusion
Multer est la porte d'entrée de notre pipeline. Il garantit que les fichiers Word sont reçus de manière intègre et sécurisée, permettant ainsi à la conversion vers le format Europass de s'effectuer sur une base de données fiable.
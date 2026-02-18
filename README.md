# POC : Conversion Word vers PDF (TypeScript & Docker)

Ce dépôt contient une Preuve de Concept (POC) validant la brique technique de **conversion de documents**.
Il s'agit d'une composante essentielle du projet de stage "Génération de CV Europass", permettant de transformer le CV généré (Word) en format PDF pour l'analyse IA ou le téléchargement final.

## 🛠 Stack Technique

* **Langage :** TypeScript (Node.js)
* **Librairie :** `libreoffice-convert`
* **Infrastructure :** Docker

## 🐳 Pourquoi avons-nous choisi Docker ?

L'utilisation de Docker est centrale dans cette solution pour trois raisons majeures :

### 1. Gestion des dépendances lourdes (LibreOffice)
La librairie `libreoffice-convert` n'est qu'une interface (wrapper). Pour fonctionner, elle exige que **la suite bureautique LibreOffice** soit installée sur la machine qui exécute le code.
* **Sans Docker :** Chaque développeur doit installer manuellement LibreOffice sur son Mac/PC. De plus, l'installation sur un serveur de production (souvent sans interface graphique) est complexe.
* **Avec Docker :** Nous utilisons une image Linux minimale sur laquelle LibreOffice est préinstallé. Le développeur n'a rien à installer à part Docker.

### 2. Parité Dev / Prod (SAP BTP)
L'application finale sera déployée sur **SAP BTP**. En conteneurisant l'application dès maintenant :
* Nous garantissons que le code s'exécutera exactement de la même manière en local et sur le cloud.
* Nous évitons les problèmes de compatibilité liés aux différences d'OS (Mac en dev vs Linux en prod).

### 3. Simplicité de déploiement
L'image Docker contient tout le nécessaire (Node.js + LibreOffice + Code). Pour déployer la fonctionnalité, il suffit de pousser cette image, sans avoir à configurer des "Buildpacks" complexes pour installer des binaires externes.

## 🚀 Comment lancer le projet

### Prérequis
* Docker Desktop installé et lancé.
* Un fichier `input.docx` à la racine du projet.

### Installation et Lancement

1. **Construire l'image Docker**
   Cette étape installe TypeScript, compile le code et prépare l'environnement Linux avec LibreOffice. 
   -> docker build -t poc-word-to-pdf .
   Pour lancer la conversion
   -> docker run --rm -v "$(pwd):/app" poc-word-to-pdf# POC-Gotenberg-converter

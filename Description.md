# Documentation Technique : Microservice de Conversion Word vers PDF

## 1. Vue d'Ensemble
Ce projet constitue le POC (Proof of Concept) de la **Phase 1C** du stage. Il s'agit d'une API REST conteneurisée permettant la conversion fluide de documents `.docx` (CV Flexso) en documents `.pdf` (Format Europass).

L'application est hébergée sur **SAP Business Technology Platform (BTP)** au sein de l'environnement **Cloud Foundry**.

## 2. Architecture Technique
L'architecture repose sur une approche de microservice isolée pour garantir la portabilité et la gestion des dépendances complexes (LibreOffice).

* **Runtime** : Node.js 18 (Debian Bookworm)
* **Framework API** : Express.js
* **Moteur de Conversion** : LibreOffice (installé via Docker)
* **Gestion des Uploads** : Multer (stockage temporaire en mémoire tampon/disque)
* **Conteneurisation** : Docker (Image Multi-plateforme `linux/amd64`)



## 3. Déploiement sur SAP BTP

### 3.1. Stratégie Docker
En raison de l'absence de LibreOffice dans les "Buildpacks" standards de SAP BTP, nous utilisons une stratégie **Docker-based deployment**. L'image est construite sur une architecture `amd64` pour assurer la compatibilité avec les serveurs SAP (indépendamment de l'architecture ARM du poste de développement M4).

### 3.2. Configuration du Manifest (`manifest.yml`)
Le déploiement est piloté par un fichier manifest définissant les ressources nécessaires :
* **Mémoire** : 1024M (Requis pour le rendu graphique de LibreOffice).
* **Routes** : `cv-converter-marica.cfapps.us10-001.hana.ondemand.com`
* **Health Check** : Type HTTP sur la racine `/` pour garantir la disponibilité de l'instance.

## 4. Utilisation de l'API

### Endpoint Principal
`POST /convert`

### Paramètres (Body - form-data)
| Clé | Type | Description |
| :--- | :--- | :--- |
| `file` | File | Le document .docx à convertir |

### Réponse
* **Success (200)** : Renvoie le flux binaire du fichier PDF (application/pdf).
* **Error (500/400)** : Message d'erreur textuel.

## 5. Procédure de Mise à Jour (CI/CD Manuel)
Pour mettre à jour le service suite à une modification du code source :
1.  **Build** : `docker build --platform linux/amd64 -t poc-word-to-pdf .`
2.  **Tag** : `docker tag poc-word-to-pdf <user>/poc-word-to-pdf:latest`
3.  **Push** : `docker push <user>/poc-word-to-pdf:latest`
4.  **Deploy** : `cf push`

---
*Document généré dans le cadre du projet de conversion Europass - 2026*
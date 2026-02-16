"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const libreoffice_convert_1 = __importDefault(require("libreoffice-convert"));
const util_1 = __importDefault(require("util"));
// Promisify la fonction de conversion pour utiliser async/await
const convertAsync = util_1.default.promisify(libreoffice_convert_1.default.convert);
async function main() {
    // Chemins des fichiers (relatifs au dossier d'exécution /app dans Docker)
    const inputPath = path_1.default.resolve(__dirname, '../input.docx');
    const outputPath = path_1.default.resolve(__dirname, '../output.pdf');
    console.log('🚀 Démarrage du POC Conversion (TypeScript)...');
    try {
        // 1. Vérifier si le fichier source existe
        if (!fs_1.default.existsSync(inputPath)) {
            throw new Error(`Le fichier source est introuvable : ${inputPath}`);
        }
        // 2. Lire le fichier Word
        console.log(`📖 Lecture du fichier : ${inputPath}`);
        const docxBuf = fs_1.default.readFileSync(inputPath);
        // 3. Convertir en PDF
        console.log('⚙️ Conversion en cours via LibreOffice...');
        // Le 3ème argument est pour les options de filtre, undefined ici
        const pdfBuf = await convertAsync(docxBuf, '.pdf', undefined);
        // 4. Écrire le fichier de sortie
        fs_1.default.writeFileSync(outputPath, pdfBuf);
        console.log(`✅ Succès ! PDF généré ici : ${outputPath}`);
    }
    catch (err) {
        console.error('❌ Erreur lors de la conversion :');
        console.error(err);
        if (err.message && err.message.includes('libreoffice')) {
            console.error('👉 Astuce : Êtes-vous sûr de lancer ce script via Docker ? LibreOffice est requis.');
        }
    }
}
main();

import path from 'path';
import fs from 'fs';
import libre from 'libreoffice-convert';
import util from 'util';

// Promisify la fonction de conversion pour utiliser async/await
const convertAsync = util.promisify(libre.convert);

async function main() {
    // Chemins des fichiers (relatifs au dossier d'exécution /app dans Docker)
    const inputPath = path.resolve(__dirname, '../files/input.docx');
    const outputPath = path.resolve(__dirname, '../files/output.pdf');

    console.log('🚀 Démarrage du POC Conversion (TypeScript)...');

    try {
        // 1. Vérifier si le fichier source existe
        if (!fs.existsSync(inputPath)) {
            throw new Error(`Le fichier source est introuvable : ${inputPath}`);
        }

        // 2. Lire le fichier Word
        console.log(`📖 Lecture du fichier : ${inputPath}`);
        const docxBuf = fs.readFileSync(inputPath);

        // 3. Convertir en PDF
        console.log('⚙️ Conversion en cours via LibreOffice...');
        // Le 3ème argument est pour les options de filtre, undefined ici
        const pdfBuf = await convertAsync(docxBuf, '.pdf', undefined);

        // 4. Écrire le fichier de sortie
        fs.writeFileSync(outputPath, pdfBuf);

        console.log(`✅ Succès ! PDF généré ici : ${outputPath}`);

    } catch (err: any) {
        console.error('❌ Erreur lors de la conversion :');
        console.error(err);
        
        if (err.message && err.message.includes('libreoffice')) {
            console.error('👉 Astuce : Êtes-vous sûr de lancer ce script via Docker ? LibreOffice est requis.');
        }
    }
}

main();
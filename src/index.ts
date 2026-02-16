import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import libre from 'libreoffice-convert';
import util from 'util';

const convertAsync = util.promisify(libre.convert);
const app = express();
const port = process.env.PORT || 4004; // Port par défaut SAP CAP

// Configuration de Multer pour stocker temporairement le fichier uploadé
const upload = multer({ dest: 'uploads/' });

app.post('/convert', upload.single('file'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).send('Aucun fichier reçu.');
        }

        console.log(`📩 Fichier reçu : ${req.file.originalname}`);
        const inputPath = req.file.path;
        const outputPath = path.join('uploads', `${req.file.filename}.pdf`);

        // 1. Lecture du Word reçu
        const docxBuf = fs.readFileSync(inputPath);

        // 2. Conversion via LibreOffice
        console.log('⚙️ Conversion en cours...');
        const pdfBuf = await convertAsync(docxBuf, '.pdf', undefined);

        // 3. Envoi du PDF au client
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=conversion.pdf`);
        res.send(pdfBuf);

        // 4. Nettoyage des fichiers temporaires
        fs.unlinkSync(inputPath); 
        console.log('✅ Conversion réussie et envoyée.');

    } catch (err) {
        console.error('❌ Erreur:', err);
        res.status(500).send('Erreur lors de la conversion.');
    }
});

app.listen(port, () => {
    console.log(`🚀 Serveur de conversion prêt sur le port ${port}`);
});
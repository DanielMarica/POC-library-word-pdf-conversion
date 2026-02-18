import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import util from "util";
import { execFile } from "child_process";

const execFileAsync = util.promisify(execFile);

// Logger
const logFile = path.join(__dirname, "../files/app.log");
const APP_START_TIME = Date.now(); // ← détecte les redémarrages

function log(message: string) {
  const timestamp = new Date().toISOString();
  const uptime = Math.round((Date.now() - APP_START_TIME) / 1000);
  const logMsg = `[${timestamp}] [uptime: ${uptime}s] ${message}\n`;
  try {
    fs.appendFileSync(logFile, logMsg);
  } catch (e) {
    console.error("Logger file write error:", e);
  }
  console.log(logMsg.trim());
}

const app = express();
const port = process.env.PORT || 4004;
const upload = multer({ dest: "uploads/" });

// ← Si uptime est petit (< 30s), le conteneur vient de redémarrer
log(`App starting up... (Node.js ${process.version})`);
log(`PORT: ${port}`);

app.post(
  "/convert",
  upload.single("file"),
  async (req: Request, res: Response) => {
    const startTime = Date.now();
    const uptime = Math.round((Date.now() - APP_START_TIME) / 1000);
    log(`POST /convert called (conteneur actif depuis ${uptime}s)`);

    // ← Si uptime < 60s = cold start, BTP venait de freeze
    if (uptime < 60) {
      log(`⚠️ COLD START DÉTECTÉ : conteneur redémarré récemment !`);
    } else {
      log(`✅ WARM : conteneur actif depuis ${uptime}s, pas de freeze`);
    }

    try {
      if (!req.file) {
        log("No file uploaded");
        return res.status(400).send("Aucun fichier reçu.");
      }

      log(`Fichier reçu : ${req.file.originalname}, taille : ${req.file.size} octets`);

      const inputPath = req.file.path;
      const outputPath = path.join("uploads", `${req.file.filename}.pdf`);

      const memBefore = process.memoryUsage();
      log(`Memory before: RSS=${Math.round(memBefore.rss / 1024 / 1024)}MB, Heap=${Math.round(memBefore.heapUsed / 1024 / 1024)}MB`);

      log("Début de la conversion via unoserver...");
      const convertStart = Date.now();

      await execFileAsync("unoconvert", [
        "--convert-to", "pdf",
        "--host", "127.0.0.1",
        "--port", "2003",
        inputPath,
        outputPath,
      ]);

      const convertDuration = Date.now() - convertStart;
      const pdfBuf = fs.readFileSync(outputPath);
      log(`✅ Conversion terminée en ${convertDuration} ms (PDF: ${Math.round(pdfBuf.length / 1024)}KB)`);

      const memAfter = process.memoryUsage();
      log(`Memory after: RSS=${Math.round(memAfter.rss / 1024 / 1024)}MB, Heap=${Math.round(memAfter.heapUsed / 1024 / 1024)}MB`);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=conversion.pdf");
      res.send(pdfBuf);
      log("✅ PDF envoyé au client.");

      try {
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
        log("🧹 Fichiers temporaires supprimés.");
      } catch (cleanupErr) {
        log(`⚠️ Erreur nettoyage: ${cleanupErr}`);
      }

      const duration = Date.now() - startTime;
      log(`⏱️ /convert terminé en ${duration} ms`);

    } catch (err) {
      log(`❌ Erreur dans /convert: ${err instanceof Error ? err.stack : util.inspect(err)}`);
      res.status(500).send("Erreur lors de la conversion.");
    }
  },
);

// Health check
app.get("/", (req: Request, res: Response) => {
  const uptime = Math.round((Date.now() - APP_START_TIME) / 1000);
  log(`GET / (santé) - uptime: ${uptime}s`);
  res.send(`Serveur de conversion prêt ! (uptime: ${uptime}s)`);
});

app.listen(port, () => {
  log(`🚀 Serveur prêt sur le port ${port}`);
});

import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import util from "util";
import { execFile } from "child_process";

const execFileAsync = util.promisify(execFile);

// Logger
const logFile = path.join(__dirname, "../files/app.log");
function log(message: string) {
  const timestamp = new Date().toISOString();
  const logMsg = `[${timestamp}] ${message}\n`;
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

log("App starting up...");

app.post(
  "/convert",
  upload.single("file"),
  async (req: Request, res: Response) => {
    const startTime = Date.now();
    log("POST /convert called");

    try {
      if (!req.file) {
        log("No file uploaded");
        return res.status(400).send("Aucun fichier reçu.");
      }

      log(
        `Fichier reçu : ${req.file.originalname}, taille : ${req.file.size} octets`,
      );

      const inputPath = req.file.path;
      const outputPath = path.join("uploads", `${req.file.filename}.pdf`);

      // Mémoire avant conversion
      const memBefore = process.memoryUsage();
      log(
        `Memory before conversion: RSS=${memBefore.rss}, HeapUsed=${memBefore.heapUsed}`,
      );

      // Conversion via unoserver
      log("Début de la conversion via unoserver...");
      const convertStart = Date.now();

      await execFileAsync("unoconvert", [
        "--convert-to",
        "pdf",
        "--host",
        "127.0.0.1", // --host au lieu de --server
        "--port",
        "2003",
        inputPath,
        outputPath,
      ]);

      const convertDuration = Date.now() - convertStart;
      const pdfBuf = fs.readFileSync(outputPath);
      log(
        `Conversion terminée en ${convertDuration} ms (PDF size: ${pdfBuf.length} octets)`,
      );

      // Mémoire après conversion
      const memAfter = process.memoryUsage();
      log(
        `Memory after conversion: RSS=${memAfter.rss}, HeapUsed=${memAfter.heapUsed}`,
      );

      // Envoi du PDF
      log("Envoi du PDF au client...");
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=conversion.pdf",
      );
      res.send(pdfBuf);
      log("PDF envoyé au client.");

      // Nettoyage
      try {
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
        log("Fichiers temporaires supprimés.");
      } catch (cleanupErr) {
        log(`Erreur lors du nettoyage: ${cleanupErr}`);
      }

      const duration = Date.now() - startTime;
      log(`/convert terminé en ${duration} ms`);
    } catch (err) {
      log(
        `Erreur dans /convert: ${err instanceof Error ? err.stack : util.inspect(err)}`,
      );
      res.status(500).send("Erreur lors de la conversion.");
    }
  },
);

// Health check SAP BTP
app.get("/", (req: Request, res: Response) => {
  log("GET / (santé)");
  res.send("Serveur de conversion prêt !");
});

app.listen(port, () => {
  log(`🚀 Serveur de conversion prêt sur le port ${port}`);
});

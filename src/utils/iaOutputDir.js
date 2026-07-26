const fs = require('fs');
const os = require('os');
const path = require('path');

// Resolution du dossier ou l'IA ecrit ses fichiers generes (et ou les CLI
// Claude/Codex posent leur home et leur repertoire de travail).
//
// Sur Railway le systeme de fichiers de l'image peut etre monte en lecture
// seule, ou le conteneur tourner sous un utilisateur sans droit d'ecriture sur
// /app : `mkdir /app/ia_outputs` echoue alors avec EACCES / EROFS et toute la
// commande !claude / !codex tombe. On teste donc reellement l'ecriture (un
// mkdir qui reussit ne garantit rien quand le dossier existe deja) et on se
// rabat sur le repertoire temporaire, toujours inscriptible.
//
// La resolution est memoisee : le serveur web sert /files depuis ce meme
// dossier, il doit voir exactement celui qu'utilisent les services.

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const FALLBACK_DIR = path.join(os.tmpdir(), 'kassim-ia-outputs');

let resolved = null;

function candidateDirs() {
  const dirs = [];
  if (process.env.IA_OUTPUT_DIR) dirs.push(path.resolve(process.env.IA_OUTPUT_DIR));
  dirs.push(path.join(PROJECT_ROOT, 'ia_outputs'));
  // Le bot peut etre lance depuis un autre repertoire que la racine du projet.
  dirs.push(path.join(process.cwd(), 'ia_outputs'));
  dirs.push(FALLBACK_DIR);
  return [...new Set(dirs)];
}

// mkdir + ecriture reelle d'une sonde : c'est le seul test fiable.
function probe(dir) {
  fs.mkdirSync(dir, { recursive: true });
  const probeFile = path.join(dir, `.write-probe-${process.pid}`);
  fs.writeFileSync(probeFile, 'ok');
  fs.unlinkSync(probeFile);
}

function resolveOutputDir() {
  if (resolved) return resolved;

  const failures = [];
  for (const dir of candidateDirs()) {
    try {
      probe(dir);
      resolved = dir;
      if (failures.length) {
        console.warn(
          `[ia_outputs] ecriture refusee sur ${failures.join(', ')} — repli sur ${dir}`,
        );
      }
      return resolved;
    } catch (error) {
      failures.push(`${dir} (${error.code || error.message})`);
    }
  }

  // Aucun candidat n'est inscriptible : on renvoie quand meme le repli pour que
  // l'erreur remonte au point d'ecriture, avec un message explicite.
  throw new Error(
    `Aucun dossier de sortie inscriptible. Essayes: ${failures.join(', ')}. `
      + 'Definis IA_OUTPUT_DIR sur un chemin accessible en ecriture.',
  );
}

// Garantit l'existence d'un sous-dossier du dossier de sortie (.codex-home...).
function ensureSubDir(name) {
  const dir = path.join(resolveOutputDir(), name);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

module.exports = {
  resolveOutputDir,
  ensureSubDir,
  PROJECT_ROOT,
};

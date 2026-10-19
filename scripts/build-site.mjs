import {mkdir,copyFile,readdir} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {resolve,dirname} from 'node:path';

export const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
async function projectFiles(folder){
 const files=[];for(const entry of await readdir(resolve(root,folder),{withFileTypes:true})){const name=folder+'/'+entry.name;if(entry.isDirectory())files.push(...await projectFiles(name));else files.push(name);}return files;
}
// Pages está configurado en esta rama para servir /docs. Estos archivos son
// salidas reproducibles; las fuentes siguen en la raíz del repositorio.
export const runtimeFiles=[
 '.nojekyll','index.html','app.css','workspace.css','app.js','engine.js','importers.js','documents.js','plans-ui.js','relations.js','workspace-ui.js',
 'sw.js','icon.svg','manifest.webmanifest','propuestas.html','avance-obra.html',
 'presentacion.html','aplicacion-unificada.png','propuesta-funcional.md',
 'vendor/excel-reader.js','vendor/read-excel-file-LICENSE.txt',
 'ejemplos/datos-ejemplo.xlsx','ejemplos/cronograma-ejemplo.csv',
 'ejemplos/metrados-ejemplo.csv','ejemplos/cronograma-ejemplo.xml',
 ...await projectFiles('project')
];
export async function buildSite(){
 for(const name of runtimeFiles){const to=resolve(root,'docs',name);await mkdir(dirname(to),{recursive:true});await copyFile(resolve(root,name),to);}
 console.log(`Sitio generado en docs/: ${runtimeFiles.length} archivos. Fuente de Pages: maqueta-pitocuna /docs.`);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)await buildSite();

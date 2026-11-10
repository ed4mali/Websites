import {build} from 'esbuild';
import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('dist/assets',{recursive:true});
await build({entryPoints:['static-entry.tsx'],bundle:true,outfile:'dist/assets/app.js',minify:true,jsx:'automatic',target:['es2022'],define:{'process.env.NODE_ENV':'"production"'}});
await writeFile('dist/index.html','<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TowDesk · Towing made simple</title><meta name="description" content="A static, browser-local towing dispatch workspace."><link rel="stylesheet" href="./assets/app.css"></head><body><div id="root"></div><script src="./assets/app.js" defer></script></body></html>');
console.log('Static TowDesk built in dist/');

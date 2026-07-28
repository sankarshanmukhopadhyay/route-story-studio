import { cp, mkdir, rm } from 'node:fs/promises';

const output = 'dist';
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const path of ['index.html', '404.html', 'assets', 'src', 'schemas', 'public']) {
  await cp(path, `${output}/${path}`, { recursive: true });
}

console.log('Static site assembled in dist/.');

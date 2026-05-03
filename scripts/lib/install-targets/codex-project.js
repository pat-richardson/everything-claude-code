const fs = require('fs');
const path = require('path');

const {
  createFlatFileOperations,
  createInstallTargetAdapter,
  createManagedOperation,
  isForeignPlatformPath,
} = require('./helpers');

module.exports = createInstallTargetAdapter({
  id: 'codex-project',
  target: 'codex-project',
  kind: 'project',
  rootSegments: ['.codex'],
  installStatePathSegments: ['ecc-install-state.json'],
  nativeRootRelativePath: '.codex',
  planOperations(input, adapter) {
    const modules = Array.isArray(input.modules)
      ? input.modules
      : (input.module ? [input.module] : []);
    const planningInput = {
      repoRoot: input.repoRoot,
      projectRoot: input.projectRoot,
      homeDir: input.homeDir,
    };
    const targetRoot = adapter.resolveRoot(planningInput);

    return modules.flatMap(module => {
      const paths = Array.isArray(module.paths) ? module.paths : [];
      return paths
        .filter(sourceRelativePath => !isForeignPlatformPath(sourceRelativePath, 'codex'))
        .flatMap(sourceRelativePath => {
          if (sourceRelativePath === 'agents') {
            return createFlatFileOperations({
              moduleId: module.id,
              repoRoot: input.repoRoot,
              sourceRelativePath: '.codex/agents',
              destinationDir: path.join(targetRoot, 'agents'),
            });
          }

          if (sourceRelativePath === '.agents' || sourceRelativePath === 'AGENTS.md') {
            return [];
          }

          if (sourceRelativePath === '.codex') {
            const codexRoot = path.join(input.repoRoot || '', '.codex');
            if (!input.repoRoot || !fs.existsSync(codexRoot) || !fs.statSync(codexRoot).isDirectory()) {
              return [];
            }

            return fs.readdirSync(codexRoot, { withFileTypes: true })
              .sort((left, right) => left.name.localeCompare(right.name))
              .filter(entry => entry.name !== 'agents')
              .map(entry => createManagedOperation({
                moduleId: module.id,
                sourceRelativePath: path.join('.codex', entry.name),
                destinationPath: path.join(targetRoot, entry.name),
                strategy: 'preserve-relative-path',
              }));
          }

          return adapter.createScaffoldOperation(module.id, sourceRelativePath, planningInput);
        });
    });
  },
});

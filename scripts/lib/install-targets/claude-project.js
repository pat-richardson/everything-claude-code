const path = require('path');

const {
  createInstallTargetAdapter,
  createRemappedOperation,
  isForeignPlatformPath,
} = require('./helpers');

module.exports = createInstallTargetAdapter({
  id: 'claude-project',
  target: 'claude-project',
  kind: 'project',
  rootSegments: ['.claude'],
  installStatePathSegments: ['ecc-install-state.json'],
  nativeRootRelativePath: '.claude-plugin',
  planOperations(input, adapter) {
    const modules = Array.isArray(input.modules)
      ? input.modules
      : (input.module ? [input.module] : []);

    return modules.flatMap(module => {
      const paths = Array.isArray(module.paths) ? module.paths : [];
      return paths
        .filter(sourceRelativePath => !isForeignPlatformPath(sourceRelativePath, 'claude'))
        .map(sourceRelativePath => {
          if (sourceRelativePath === 'AGENTS.md') {
            return createRemappedOperation(
              adapter,
              module.id,
              sourceRelativePath,
              path.join(adapter.resolveRoot(input), 'CLAUDE.md'),
              { strategy: 'preserve-relative-path' }
            );
          }

          return adapter.createScaffoldOperation(
            module.id,
            sourceRelativePath,
            input
          );
        });
    });
  },
});

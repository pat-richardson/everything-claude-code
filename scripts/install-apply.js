#!/usr/bin/env node
/**
 * Refactored ECC installer runtime.
 *
 * Keeps the legacy language-based install entrypoint intact while moving
 * target-specific mutation logic into testable Node code.
 */

const os = require('os');
const fs = require('fs');
const path = require('path');
const {
  SUPPORTED_INSTALL_TARGETS,
  listLegacyCompatibilityLanguages,
} = require('./lib/install-manifests');
const {
  LEGACY_INSTALL_TARGETS,
  normalizeInstallRequest,
  parseInstallArgs,
} = require('./lib/install/request');

function getHelpText() {
  const languages = listLegacyCompatibilityLanguages();

  return `
Usage: install.sh [--target <${LEGACY_INSTALL_TARGETS.join('|')}>] [--dry-run] [--json] <language> [<language> ...]
       install.sh [--target <${SUPPORTED_INSTALL_TARGETS.join('|')}>] [--dry-run] [--claim] [--json] --profile <name> [--with <component>]... [--without <component>]...
       install.sh [--target <${SUPPORTED_INSTALL_TARGETS.join('|')}>] [--dry-run] [--claim] [--json] --modules <id,id,...> [--with <component>]... [--without <component>]...
       install.sh [--dry-run] [--claim] [--json] --config <path>

Targets:
  claude       (default) - Install ECC into ~/.claude/ with managed rules/skills under rules/ecc and skills/ecc
  cursor       - Install rules, hooks, and bundled Cursor configs to ./.cursor/
  antigravity  - Install rules, workflows, skills, and agents to ./.agent/

Options:
  --profile <name>    Resolve and install a manifest profile
  --modules <ids>     Resolve and install explicit module IDs
  --with <component>  Include a user-facing install component
  --without <component>
                      Exclude a user-facing install component
  --config <path>     Load install intent from ecc-install.json
  --dry-run    Show the install plan without copying files
  --claim      Write ecc-install.json and install-state for an existing layout without copying files
  --json       Emit machine-readable plan/result JSON
  --help       Show this help text

Available languages:
${languages.map(language => `  - ${language}`).join('\n')}
`;
}

function showHelp(exitCode = 0) {
  console.log(getHelpText());
  process.exit(exitCode);
}

function printHumanPlan(plan, dryRun) {
  console.log(`${dryRun ? 'Dry-run install plan' : 'Applying install plan'}:\n`);
  console.log(`Mode: ${plan.mode}`);
  console.log(`Target: ${plan.target}`);
  console.log(`Adapter: ${plan.adapter.id}`);
  console.log(`Install root: ${plan.installRoot}`);
  console.log(`Install-state: ${plan.installStatePath}`);
  if (plan.mode === 'legacy') {
    console.log(`Languages: ${plan.languages.join(', ')}`);
  } else {
    if (plan.mode === 'legacy-compat') {
      console.log(`Legacy languages: ${plan.legacyLanguages.join(', ')}`);
    }
    console.log(`Profile: ${plan.profileId || '(custom modules)'}`);
    console.log(`Included components: ${plan.includedComponentIds.join(', ') || '(none)'}`);
    console.log(`Excluded components: ${plan.excludedComponentIds.join(', ') || '(none)'}`);
    console.log(`Requested modules: ${plan.requestedModuleIds.join(', ') || '(none)'}`);
    console.log(`Selected modules: ${plan.selectedModuleIds.join(', ') || '(none)'}`);
    if (plan.skippedModuleIds.length > 0) {
      console.log(`Skipped modules: ${plan.skippedModuleIds.join(', ')}`);
    }
    if (plan.excludedModuleIds.length > 0) {
      console.log(`Excluded modules: ${plan.excludedModuleIds.join(', ')}`);
    }
  }
  console.log(`Operations: ${plan.operations.length}`);

  if (plan.warnings.length > 0) {
    console.log('\nWarnings:');
    for (const warning of plan.warnings) {
      console.log(`- ${warning}`);
    }
  }

  console.log('\nPlanned file operations:');
  for (const operation of plan.operations) {
    console.log(`- ${operation.sourceRelativePath} -> ${operation.destinationPath}`);
  }

  if (!dryRun) {
    console.log(`\nDone. Install-state written to ${plan.installStatePath}`);
  }
}

function writeJsonFile(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function createClaimConfig(plan) {
  const config = {
    version: 1,
    target: plan.target,
  };

  if (plan.profileId) {
    config.profile = plan.profileId;
  }
  if (Array.isArray(plan.explicitModuleIds) && plan.explicitModuleIds.length > 0) {
    config.modules = plan.explicitModuleIds;
  }
  if (Array.isArray(plan.includedComponentIds) && plan.includedComponentIds.length > 0) {
    config.include = plan.includedComponentIds;
  }
  if (Array.isArray(plan.excludedComponentIds) && plan.excludedComponentIds.length > 0) {
    config.exclude = plan.excludedComponentIds;
  }

  return config;
}

function claimInstallPlan(plan, options = {}) {
  const { writeInstallState } = require('./lib/install-state');
  const projectRoot = options.projectRoot || process.cwd();
  const configPath = options.configPath || path.join(projectRoot, 'ecc-install.json');
  const claimConfig = createClaimConfig(plan);

  writeJsonFile(configPath, claimConfig);
  writeInstallState(plan.installStatePath, plan.statePreview);

  return {
    ...plan,
    claimed: true,
    claimConfigPath: configPath,
  };
}

function main() {
  try {
    const options = parseInstallArgs(process.argv);

    if (options.help) {
      showHelp(0);
    }

    const {
      findDefaultInstallConfigPath,
      loadInstallConfig,
    } = require('./lib/install/config');
    const { applyInstallPlan } = require('./lib/install-executor');
    const { createInstallPlanFromRequest } = require('./lib/install/runtime');
    const defaultConfigPath = options.configPath || options.languages.length > 0
      ? null
      : findDefaultInstallConfigPath({ cwd: process.cwd() });
    const config = options.configPath
      ? loadInstallConfig(options.configPath, { cwd: process.cwd() })
      : (defaultConfigPath ? loadInstallConfig(defaultConfigPath, { cwd: process.cwd() }) : null);
    const request = normalizeInstallRequest({
      ...options,
      config,
    });
    const plan = createInstallPlanFromRequest(request, {
      projectRoot: process.cwd(),
      homeDir: process.env.HOME || os.homedir(),
      claudeRulesDir: process.env.CLAUDE_RULES_DIR || null,
    });

    if (options.dryRun) {
      if (options.json) {
        console.log(JSON.stringify({ dryRun: true, plan }, null, 2));
      } else {
        printHumanPlan(plan, true);
      }
      return;
    }

    if (options.claim) {
      const result = claimInstallPlan(plan, {
        projectRoot: process.cwd(),
        configPath: options.configPath,
      });
      if (options.json) {
        console.log(JSON.stringify({ dryRun: false, claim: true, result }, null, 2));
      } else {
        printHumanPlan(result, false);
        console.log(`Claim config: ${result.claimConfigPath}`);
      }
      return;
    }

    const result = applyInstallPlan(plan);
    if (options.json) {
      console.log(JSON.stringify({ dryRun: false, result }, null, 2));
    } else {
      printHumanPlan(result, false);
    }
  } catch (error) {
    process.stderr.write(`Error: ${error.message}${getHelpText()}`);
    process.exit(1);
  }
}

main();

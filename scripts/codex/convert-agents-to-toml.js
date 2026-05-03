#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

let TOML;
try {
  TOML = require('@iarna/toml');
} catch {
  console.error('[ecc-codex-agents] Missing dependency: @iarna/toml');
  console.error('[ecc-codex-agents] Run: npm install   (from the ECC repo root)');
  process.exit(1);
}

const DEFAULT_MODEL = 'gpt-5.4';
const DEFAULT_REASONING = 'medium';
const DEFAULT_SANDBOX = 'read-only';
const DEFAULT_MAX_THREADS = 6;
const DEFAULT_MAX_DEPTH = 1;
const MODEL_ALIASES = {
  opus: 'gpt-5.5',
  sonnet: 'gpt-5.4',
  haiku: 'gpt-5.4-mini',
};
const SUPPORTED_REASONING = new Set(['low', 'medium', 'high', 'xhigh']);
const NICKNAME_RE = /^[A-Za-z0-9 _-]+$/;
const READ_ONLY_TOOLS = new Set(['read', 'grep', 'glob', 'bash']);
const WRITE_TOOLS = new Set(['write', 'edit', 'multiedit']);
const MANAGED_KEYS = new Set([
  'name',
  'description',
  'tools',
  'model',
  'reasoning_effort',
  'model_reasoning_effort',
  'sandbox_mode',
  'nickname_candidates',
]);
const SKILL_REFERENCE_PATTERNS = [
  /skill:\s*`([^`]+)`/gi,
  /skills?:\s*`([^`]+)`/gi,
  /skills\/([a-z0-9_-]+)/gi,
];

function usage() {
  console.error(
    'Usage: convert-agents-to-toml.js --source <dir> --dest <dir> [--config <file>] [--wire-config] [--dry-run] [--check] [--include <glob>] [--exclude <glob>] [--fail-on-unsupported]',
  );
}

function parseArgs(argv) {
  const options = {
    source: '',
    dest: '',
    config: '',
    dryRun: false,
    check: false,
    wireConfig: false,
    failOnUnsupported: false,
    include: [],
    exclude: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    switch (arg) {
      case '--source':
        options.source = argv[index + 1] || '';
        index += 1;
        break;
      case '--dest':
        options.dest = argv[index + 1] || '';
        index += 1;
        break;
      case '--config':
        options.config = argv[index + 1] || '';
        index += 1;
        break;
      case '--include':
        options.include.push(argv[index + 1] || '');
        index += 1;
        break;
      case '--exclude':
        options.exclude.push(argv[index + 1] || '');
        index += 1;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--check':
        options.check = true;
        break;
      case '--wire-config':
        options.wireConfig = true;
        break;
      case '--fail-on-unsupported':
        options.failOnUnsupported = true;
        break;
      default:
        console.error(`[ecc-codex-agents] Unknown argument: ${arg}`);
        usage();
        process.exit(1);
    }
  }

  if (!options.source || !options.dest) {
    usage();
    process.exit(1);
  }

  if (options.wireConfig && !options.config) {
    console.error('[ecc-codex-agents] --wire-config requires --config <file>');
    process.exit(1);
  }

  return options;
}

function log(message) {
  console.log(`[ecc-codex-agents] ${message}`);
}

function warn(message) {
  console.warn(`[ecc-codex-agents] WARNING: ${message}`);
}

function normalizePath(value) {
  return value.split(path.sep).join('/');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function globToRegExp(pattern) {
  let source = '^';
  for (let index = 0; index < pattern.length; index += 1) {
    const char = pattern[index];
    const next = pattern[index + 1];
    if (char === '*' && next === '*') {
      source += '.*';
      index += 1;
      continue;
    }
    if (char === '*') {
      source += '[^/]*';
      continue;
    }
    if (char === '?') {
      source += '.';
      continue;
    }
    source += escapeRegExp(char);
  }
  source += '$';
  return new RegExp(source);
}

function matchesAnyGlob(value, patterns) {
  if (patterns.length === 0) {
    return false;
  }
  return patterns.some(pattern => globToRegExp(pattern).test(value));
}

function shouldInclude(relativePath, include, exclude) {
  const basename = path.posix.basename(relativePath);
  const includeMatch =
    include.length === 0 ||
    matchesAnyGlob(relativePath, include) ||
    matchesAnyGlob(basename, include);
  const excludeMatch = matchesAnyGlob(relativePath, exclude) || matchesAnyGlob(basename, exclude);
  return includeMatch && !excludeMatch;
}

function readMarkdownFiles(sourceDir, include, exclude) {
  return fs
    .readdirSync(sourceDir, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
    .map(entry => entry.name)
    .filter(fileName => shouldInclude(fileName, include, exclude))
    .sort()
    .map(fileName => path.join(sourceDir, fileName));
}

function parseFrontmatterValue(rawValue) {
  const value = rawValue.trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  if ((value.startsWith('[') && value.endsWith(']')) || (value.startsWith('{') && value.endsWith('}'))) {
    try {
      return JSON.parse(value.replace(/'/g, '"'));
    } catch {
      if (value.startsWith('[') && value.endsWith(']')) {
        return value
          .slice(1, -1)
          .split(',')
          .map(entry => entry.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
      }
      return value;
    }
  }

  if (/^(true|false)$/i.test(value)) {
    return value.toLowerCase() === 'true';
  }

  return value;
}

function unique(values) {
  return Array.from(new Set(values));
}

function parseMarkdownAgent(sourceText) {
  const normalized = sourceText.replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) {
    return { frontmatter: {}, body: normalized.trim() };
  }

  const end = normalized.indexOf('\n---\n', 4);
  if (end === -1) {
    return { frontmatter: {}, body: normalized.trim() };
  }

  const frontmatterText = normalized.slice(4, end);
  const body = normalized.slice(end + 5).trim();
  const frontmatter = {};

  for (const line of frontmatterText.split('\n')) {
    const match = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line.trim());
    if (!match) {
      continue;
    }
    frontmatter[match[1]] = parseFrontmatterValue(match[2]);
  }

  return { frontmatter, body };
}

function firstSentence(text) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) {
    return '';
  }

  const match = normalized.match(/(.+?[.!?])(?:\s|$)/);
  return match ? match[1].trim() : normalized;
}

function isTargetedHarnessSpecificLine(line) {
  const trimmed = line.trim();
  if (!trimmed) {
    return false;
  }

  if (/^use\s+\/[a-z0-9-]+(?:\s|$)/i.test(trimmed)) {
    return true;
  }
  if (/^(?:run|trigger(?:ed)? by|invoked by)\s+\/[a-z0-9-]+(?:\s|$)/i.test(trimmed)) {
    return true;
  }
  if (/\bclaude-only\b/i.test(trimmed)) {
    return true;
  }
  if (/\bCLAUDE\.md\b/.test(trimmed)) {
    return true;
  }
  if (/\bClaude Code\b/.test(trimmed)) {
    return true;
  }
  if (/\bslash[- ]command\b/i.test(trimmed)) {
    return true;
  }
  return false;
}

function normalizeDeveloperInstructions(description, body) {
  const source = body.trim() || description.trim();
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const keptLines = [];

  for (const line of lines) {
    if (isTargetedHarnessSpecificLine(line)) {
      continue;
    }
    keptLines.push(line);
  }

  return keptLines.join('\n').replace(/\n{4,}/g, '\n\n\n').trim();
}

function normalizeTools(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(entry => String(entry).trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean);
}

function normalizeNicknameCandidates(value, warnings, sourceLabel) {
  if (value === undefined) {
    return null;
  }

  if (!Array.isArray(value) || value.length === 0) {
    warnings.push(`${sourceLabel}: Unsupported metadata nickname_candidates=${String(value)}`);
    return null;
  }

  const normalized = value
    .map(entry => String(entry).trim())
    .filter(Boolean);

  if (
    normalized.length !== value.length ||
    unique(normalized).length !== normalized.length ||
    normalized.some(entry => !NICKNAME_RE.test(entry))
  ) {
    warnings.push(`${sourceLabel}: Unsupported metadata nickname_candidates=${JSON.stringify(value)}`);
    return null;
  }

  return normalized;
}

function resolveModel(frontmatter, warnings, sourceLabel) {
  const model = typeof frontmatter.model === 'string' ? frontmatter.model.trim() : '';
  if (!model) {
    return DEFAULT_MODEL;
  }

  const alias = MODEL_ALIASES[model.toLowerCase()];
  if (alias) {
    return alias;
  }

  if (/^(gpt-|o[1-9]|codex-)/.test(model)) {
    return model;
  }

  warnings.push(`${sourceLabel}: Unsupported metadata model=${model}`);
  return DEFAULT_MODEL;
}

function resolveReasoning(frontmatter, slug, description, body, warnings, sourceLabel) {
  const rawValue = frontmatter.model_reasoning_effort ?? frontmatter.reasoning_effort;
  const raw = typeof rawValue === 'string' ? rawValue.trim() : '';
  if (raw) {
    if (SUPPORTED_REASONING.has(raw)) {
      return raw;
    }
    warnings.push(`${sourceLabel}: Unsupported metadata reasoning_effort=${raw}`);
  }

  const intentText = `${slug} ${description} ${body}`.toLowerCase();
  if (/(review|security|audit|vulnerab)/.test(intentText)) {
    return 'high';
  }
  if (/(explor|docs|research|lookup|analy)/.test(intentText)) {
    return 'medium';
  }
  return DEFAULT_REASONING;
}

function resolveSandbox(frontmatter, tools, warnings, sourceLabel) {
  const raw = typeof frontmatter.sandbox_mode === 'string' ? frontmatter.sandbox_mode.trim() : '';
  if (raw) {
    if (raw === 'read-only' || raw === 'workspace-write') {
      return raw;
    }
    warnings.push(`${sourceLabel}: Unsupported metadata sandbox_mode=${raw}`);
  }

  const normalizedTools = tools.map(tool => tool.toLowerCase());
  if (normalizedTools.some(tool => WRITE_TOOLS.has(tool))) {
    return 'workspace-write';
  }
  if (normalizedTools.length > 0 && normalizedTools.every(tool => READ_ONLY_TOOLS.has(tool))) {
    return 'read-only';
  }
  return DEFAULT_SANDBOX;
}

function collectUnsupportedMetadata(frontmatter, warnings, sourceLabel) {
  for (const [key, value] of Object.entries(frontmatter)) {
    if (!MANAGED_KEYS.has(key)) {
      warnings.push(`${sourceLabel}: Unsupported metadata ${key}=${String(value)}`);
    }
  }
}

function normalizeAgentName(frontmatterName, roleSection) {
  if (typeof frontmatterName !== 'string' || !frontmatterName.trim()) {
    return roleSection;
  }
  return frontmatterName.trim().replace(/-/g, '_');
}

function inferSkillIds(body) {
  const skillIds = [];

  for (const line of body.split('\n')) {
    const normalizedLine = line.trim();
    if (!/\bskill\b|\bskills\b|skills\//i.test(normalizedLine)) {
      continue;
    }

    const directPathRegex = /skills\/([a-z0-9_-]+)/gi;
    let pathMatch;
    while ((pathMatch = directPathRegex.exec(normalizedLine)) !== null) {
      skillIds.push(pathMatch[1]);
    }

    const backtickRegex = /`([^`]+)`/g;
    let match;
    while ((match = backtickRegex.exec(normalizedLine)) !== null) {
      const raw = String(match[1]).trim();
      const normalized = raw
        .replace(/^skills\//, '')
        .replace(/^skill:\s*/i, '')
        .replace(/\/$/, '')
        .trim();
      if (/^[a-z0-9_-]+$/i.test(normalized)) {
        skillIds.push(normalized);
      }
    }
  }
  return unique(skillIds);
}

function resolveReferencedSkills(skillIds, cwd, warnings, sourceLabel) {
  const entries = [];
  for (const skillId of skillIds) {
    const skillPath = path.join(cwd, '.agents', 'skills', skillId, 'SKILL.md');
    if (!fs.existsSync(skillPath)) {
      warnings.push(`${sourceLabel}: Referenced Codex skill not found: ${skillId}`);
      continue;
    }
    entries.push({ path: `.agents/skills/${skillId}/SKILL.md` });
  }
  return entries;
}

function inferMcpServerNamesFromTools(tools) {
  const servers = [];
  for (const tool of tools) {
    const match = /^mcp__([^_]+(?:-[^_]+)*)__/.exec(tool);
    if (match && match[1]) {
      servers.push(match[1]);
    }
  }
  return unique(servers);
}

function resolveMcpServerOverrides(serverNames, configPath, warnings, sourceLabel) {
  if (serverNames.length === 0) {
    return null;
  }

  if (!configPath || !fs.existsSync(configPath)) {
    warnings.push(`${sourceLabel}: Referenced MCP servers ${serverNames.join(', ')} but no config was provided`);
    return null;
  }

  let parsedConfig;
  try {
    parsedConfig = TOML.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (error) {
    warnings.push(`${sourceLabel}: Could not parse config for MCP server resolution (${error.message})`);
    return null;
  }

  const availableServers = parsedConfig.mcp_servers && typeof parsedConfig.mcp_servers === 'object'
    ? parsedConfig.mcp_servers
    : {};
  const selected = {};

  for (const serverName of serverNames) {
    if (availableServers[serverName] === undefined) {
      warnings.push(`${sourceLabel}: Referenced MCP server not found in config: ${serverName}`);
      continue;
    }
    selected[serverName] = availableServers[serverName];
  }

  return Object.keys(selected).length > 0 ? selected : null;
}

function generateRoleToml(sourceRelativePath, roleConfig) {
  const bodyConfig = {
    name: roleConfig.name,
    description: roleConfig.description,
  };

  if (roleConfig.nickname_candidates) {
    bodyConfig.nickname_candidates = roleConfig.nickname_candidates;
  }
  bodyConfig.enabled = true;
  if (roleConfig.model) {
    bodyConfig.model = roleConfig.model;
  }
  if (roleConfig.model_reasoning_effort) {
    bodyConfig.model_reasoning_effort = roleConfig.model_reasoning_effort;
  }
  if (roleConfig.sandbox_mode) {
    bodyConfig.sandbox_mode = roleConfig.sandbox_mode;
  }
  bodyConfig.developer_instructions = roleConfig.developer_instructions;
  if (roleConfig.mcp_servers) {
    bodyConfig.mcp_servers = roleConfig.mcp_servers;
  }
  if (roleConfig.skillsConfigEntries.length > 0) {
    bodyConfig.skills = { config: roleConfig.skillsConfigEntries };
  }

  const body = TOML.stringify(bodyConfig).trim();

  return [
    '# Generated by scripts/codex/convert-agents-to-toml.js',
    `# Source: ${sourceRelativePath}`,
    '# Do not edit this file directly; edit the markdown source instead.',
    '',
    body,
    '',
  ].join('\n');
}

function getNested(obj, pathParts) {
  let current = obj;
  for (const part of pathParts) {
    if (!current || typeof current !== 'object' || !(part in current)) {
      return undefined;
    }
    current = current[part];
  }
  return current;
}

function findTableRange(raw, tablePath) {
  const escaped = escapeRegExp(tablePath);
  const headerPattern = new RegExp(`^[ \\t]*\\[${escaped}\\][ \\t]*(?:#.*)?$`, 'm');
  const match = headerPattern.exec(raw);
  if (!match) {
    return null;
  }

  const headerEnd = raw.indexOf('\n', match.index);
  const bodyStart = headerEnd === -1 ? raw.length : headerEnd + 1;
  const nextHeaderRel = raw.slice(bodyStart).search(/^[ \t]*\[/m);
  const bodyEnd = nextHeaderRel === -1 ? raw.length : bodyStart + nextHeaderRel;
  return { bodyStart, bodyEnd };
}

function appendBlock(raw, block) {
  const prefix = raw.trimEnd();
  const normalized = block.trimEnd();
  return prefix ? `${prefix}\n\n${normalized}\n` : `${normalized}\n`;
}

function stringifyValue(value) {
  return TOML.stringify({ value }).trim().replace(/^value = /, '');
}

function updateInlineTableKeys(raw, tablePath, missingKeys) {
  const pathParts = tablePath.split('.');
  if (pathParts.length < 2) {
    return null;
  }

  const parentPath = pathParts.slice(0, -1).join('.');
  const parentRange = findTableRange(raw, parentPath);
  if (!parentRange) {
    return null;
  }

  const tableKey = pathParts[pathParts.length - 1];
  const body = raw.slice(parentRange.bodyStart, parentRange.bodyEnd);
  const lines = body.split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    const match = new RegExp(`^(\\s*${escapeRegExp(tableKey)}\\s*=\\s*\\{)(.*?)(\\}\\s*(?:#.*)?)$`).exec(
      lines[index],
    );
    if (!match) {
      continue;
    }

    const additions = Object.entries(missingKeys)
      .map(([key, value]) => `${key} = ${stringifyValue(value)}`)
      .join(', ');
    const existingEntries = match[2].trim();
    const nextEntries = existingEntries ? `${existingEntries}, ${additions}` : additions;
    lines[index] = `${match[1]}${nextEntries}${match[3]}`;
    return `${raw.slice(0, parentRange.bodyStart)}${lines.join('\n')}${raw.slice(parentRange.bodyEnd)}`;
  }

  return null;
}

function appendToTable(raw, tablePath, keyValues) {
  const range = findTableRange(raw, tablePath);
  const lines = Object.entries(keyValues).map(([key, value]) => `${key} = ${stringifyValue(value)}`);

  if (!range) {
    const inlineUpdated = updateInlineTableKeys(raw, tablePath, keyValues);
    if (inlineUpdated) {
      return inlineUpdated;
    }
    return appendBlock(raw, TOML.stringify({ [tablePath.split('.').pop()]: keyValues }).trim());
  }

  const before = raw.slice(0, range.bodyEnd).trimEnd();
  const after = raw.slice(range.bodyEnd).replace(/^\n*/, '\n');
  return `${before}\n${lines.join('\n')}\n${after}`;
}

function ensureAgentsRoot(raw, parsedConfig) {
  let nextRaw = raw;
  const agents = parsedConfig.agents && typeof parsedConfig.agents === 'object' ? parsedConfig.agents : {};
  const missingKeys = {};
  if (agents.max_threads === undefined) {
    missingKeys.max_threads = DEFAULT_MAX_THREADS;
  }
  if (agents.max_depth === undefined) {
    missingKeys.max_depth = DEFAULT_MAX_DEPTH;
  }

  if (parsedConfig.agents === undefined) {
    return appendBlock(
      nextRaw,
      ['[agents]', `max_threads = ${DEFAULT_MAX_THREADS}`, `max_depth = ${DEFAULT_MAX_DEPTH}`].join('\n'),
    );
  }

  if (Object.keys(missingKeys).length > 0) {
    nextRaw = appendToTable(nextRaw, 'agents', missingKeys);
  }
  return nextRaw;
}

function ensureAgentSections(raw, parsedConfig, roleEntries) {
  let nextRaw = ensureAgentsRoot(raw, parsedConfig);
  const reparsed = TOML.parse(nextRaw || '');

  for (const entry of roleEntries) {
    const sectionName = `agents.${entry.roleSection}`;
    const existing = getNested(reparsed, sectionName.split('.'));
    if (existing === undefined) {
      nextRaw = appendBlock(
        nextRaw,
        [`[${sectionName}]`, `description = ${stringifyValue(entry.description)}`, `config_file = ${stringifyValue(entry.configFile)}`].join('\n'),
      );
      continue;
    }

    const missingKeys = {};
    if (existing.description === undefined) {
      missingKeys.description = entry.description;
    }
    if (existing.config_file === undefined) {
      missingKeys.config_file = entry.configFile;
    }
    if (Object.keys(missingKeys).length > 0) {
      nextRaw = appendToTable(nextRaw, sectionName, missingKeys);
    }
  }

  return nextRaw;
}

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const sourceDir = path.resolve(options.source);
  const destDir = path.resolve(options.dest);
  const configPath = options.config ? path.resolve(options.config) : '';
  const cwd = process.cwd();

  if (!fs.existsSync(sourceDir) || !fs.statSync(sourceDir).isDirectory()) {
    console.error(`[ecc-codex-agents] Source directory not found: ${sourceDir}`);
    process.exit(1);
  }

  if (options.wireConfig && !fs.existsSync(configPath)) {
    console.error(`[ecc-codex-agents] Config file not found: ${configPath}`);
    process.exit(1);
  }

  const warnings = [];
  const driftPaths = [];
  const roleEntries = [];
  const outputs = [];
  const markdownFiles = readMarkdownFiles(sourceDir, options.include, options.exclude);

  for (const markdownPath of markdownFiles) {
    const sourceText = fs.readFileSync(markdownPath, 'utf8');
    const { frontmatter, body } = parseMarkdownAgent(sourceText);
    const slug = path.basename(markdownPath, '.md');
    const roleSection = slug.replace(/-/g, '_');
    const sourceRelativePath = normalizePath(path.relative(path.dirname(sourceDir), markdownPath));
    const sourceLabel = sourceRelativePath;
    const tools = normalizeTools(frontmatter.tools);
    const agentName = normalizeAgentName(frontmatter.name, roleSection);
    const description = typeof frontmatter.description === 'string' ? frontmatter.description.trim() : '';
    const summary = description || firstSentence(body) || `Codex role for ${slug}.`;
    const skillIds = inferSkillIds(body);
    const skillsConfigEntries = resolveReferencedSkills(skillIds, cwd, warnings, sourceLabel);
    const mcpServerNames = inferMcpServerNamesFromTools(tools);
    const mcpServers = resolveMcpServerOverrides(mcpServerNames, configPath, warnings, sourceLabel);

    collectUnsupportedMetadata(frontmatter, warnings, sourceLabel);

    const roleConfig = {
      name: agentName,
      description: summary,
      nickname_candidates: normalizeNicknameCandidates(frontmatter.nickname_candidates, warnings, sourceLabel),
      model: resolveModel(frontmatter, warnings, sourceLabel),
      model_reasoning_effort: resolveReasoning(frontmatter, slug, description, body, warnings, sourceLabel),
      sandbox_mode: resolveSandbox(frontmatter, tools, warnings, sourceLabel),
      developer_instructions: normalizeDeveloperInstructions(summary, body),
      mcp_servers: mcpServers,
      skillsConfigEntries,
    };

    const tomlText = generateRoleToml(sourceRelativePath, roleConfig);
    const destFileName = `${slug}.toml`;
    const destPath = path.join(destDir, destFileName);
    const existingToml = fs.existsSync(destPath) ? fs.readFileSync(destPath, 'utf8') : null;

    if (existingToml !== tomlText) {
      driftPaths.push(destPath);
      outputs.push({ destPath, tomlText });
    }

    roleEntries.push({
      roleSection,
      configFile: `agents/${destFileName}`,
      description: summary,
    });
  }

  if (warnings.length > 0 && options.failOnUnsupported) {
    for (const message of warnings) {
      warn(message);
    }
    console.error('[ecc-codex-agents] Failing because unsupported metadata was found.');
    process.exit(1);
  }

  if (!options.check && !options.dryRun) {
    ensureDirectory(destDir);
    for (const output of outputs) {
      ensureDirectory(path.dirname(output.destPath));
      fs.writeFileSync(output.destPath, output.tomlText);
      log(`Wrote ${output.destPath}`);
    }
  } else if (options.dryRun) {
    for (const output of outputs) {
      log(`Would write ${output.destPath}`);
    }
  }

  if (options.wireConfig) {
    const rawConfig = fs.readFileSync(configPath, 'utf8');
    let parsedConfig;
    try {
      parsedConfig = TOML.parse(rawConfig);
    } catch (error) {
      console.error(`[ecc-codex-agents] Failed to parse TOML config: ${error.message}`);
      process.exit(1);
    }

    const nextConfig = ensureAgentSections(rawConfig, parsedConfig, roleEntries);
    if (nextConfig !== rawConfig) {
      driftPaths.push(configPath);
      if (options.dryRun) {
        log(`Would write ${configPath}`);
      } else if (!options.check) {
        fs.writeFileSync(configPath, nextConfig);
        log(`Updated ${configPath}`);
      }
    }
  }

  for (const message of warnings) {
    warn(message);
  }

  if (options.check) {
    if (driftPaths.length > 0) {
      log('Drift detected:');
      for (const driftPath of driftPaths) {
        console.log(normalizePath(path.relative(process.cwd(), driftPath)));
      }
      process.exit(1);
    }
    log('No drift detected.');
    process.exit(0);
  }

  log(`Processed ${markdownFiles.length} markdown agent(s).`);
}

main();

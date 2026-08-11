import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const workspaceRoot = resolve(import.meta.dirname, '..')
const packagesRoot = join(workspaceRoot, 'packages')
const outputRoot = join(workspaceRoot, 'artifacts', 'npm')
const registry = 'https://registry.npmjs.org/'
const shouldPublish = process.argv.includes('--publish')
const dryRun = process.argv.includes('--dry-run')
const tagArgument = process.argv.find((argument) => argument.startsWith('--tag='))
const distTag = tagArgument?.slice('--tag='.length) || 'latest'

if (shouldPublish && dryRun) {
  throw new Error('Choose either --publish or --dry-run, not both.')
}

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: workspaceRoot,
    encoding: 'utf8',
    stdio: options.capture ? 'pipe' : 'inherit',
    ...options,
  })
}

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'))
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const packageDirectories = (await readdir(packagesRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => join(packagesRoot, entry.name))

const packages = packageDirectories
  .map((directory) => ({ directory, manifest: readJson(join(directory, 'package.json')) }))
  .filter(({ manifest }) => !manifest.private)

const packageNames = new Set(packages.map(({ manifest }) => manifest.name))
const rootVersion = readJson(join(workspaceRoot, 'package.json')).version

if (shouldPublish) {
  const tag = `v${rootVersion}`
  const headTags = run('git', ['tag', '--points-at', 'HEAD'], { capture: true }).trim().split('\n')
  const trackedChanges = run('git', ['status', '--porcelain', '--untracked-files=no'], { capture: true }).trim()
  assert(headTags.includes(tag), `Refusing to publish: HEAD must have the ${tag} tag`)
  assert(!trackedChanges, 'Refusing to publish: tracked files are not clean')
}

for (const { directory, manifest } of packages) {
  const label = manifest.name || directory
  assert(label.startsWith('@previewdock/'), `${label}: package must use the @previewdock scope`)
  assert(manifest.version === rootVersion, `${label}: expected version ${rootVersion}, found ${manifest.version}`)
  assert(manifest.description, `${label}: description is required`)
  assert(manifest.license === 'Apache-2.0', `${label}: Apache-2.0 license metadata is required`)
  assert(manifest.repository?.url === 'git+https://github.com/lookmyagent/previewdock.git', `${label}: repository URL is invalid`)
  assert(manifest.publishConfig?.access === 'public', `${label}: publishConfig.access must be public`)
  assert(Array.isArray(manifest.files) && manifest.files.includes('dist'), `${label}: dist must be included in files`)
  assert(manifest.exports?.['.'], `${label}: root export is required`)
  assert(existsSync(join(directory, 'README.md')), `${label}: README.md is required for npm`)
  assert(existsSync(join(directory, 'dist')), `${label}: dist is missing; run pnpm build first`)
}

const packageByName = new Map(packages.map((item) => [item.manifest.name, item]))
const visited = new Set()
const visiting = new Set()
const ordered = []

function visit(item) {
  const name = item.manifest.name
  if (visited.has(name)) return
  assert(!visiting.has(name), `Circular publish dependency detected at ${name}`)
  visiting.add(name)
  const dependencies = { ...item.manifest.dependencies, ...item.manifest.peerDependencies }
  for (const dependencyName of Object.keys(dependencies || {})) {
    if (packageNames.has(dependencyName)) visit(packageByName.get(dependencyName))
  }
  visiting.delete(name)
  visited.add(name)
  ordered.push(item)
}

for (const item of packages) visit(item)

rmSync(outputRoot, { force: true, recursive: true })
mkdirSync(outputRoot, { recursive: true })

const releaseManifest = []

for (const { directory, manifest } of ordered) {
  const raw = run('pnpm', ['pack', '--json', '--pack-destination', outputRoot], { cwd: directory, capture: true })
  const packed = JSON.parse(raw)
  const tarball = Array.isArray(packed) ? packed[0].filename : packed.filename
  const tarballPath = resolve(directory, tarball)
  const packedManifestText = run('tar', ['-xOf', tarballPath, 'package/package.json'], { capture: true })
  const packedManifest = JSON.parse(packedManifestText)
  const serializedManifest = JSON.stringify(packedManifest)
  const packedFiles = run('tar', ['-tf', tarballPath], { capture: true }).split('\n')

  assert(!serializedManifest.includes('workspace:'), `${manifest.name}: workspace protocol leaked into tarball`)
  assert(packedManifest.version === rootVersion, `${manifest.name}: packed version mismatch`)
  assert(packedFiles.includes('package/README.md'), `${manifest.name}: README.md is missing from tarball`)
  assert(!packedFiles.some((file) => /(^|\/)\.env($|\.)|\.pem$|\.key$/.test(file)), `${manifest.name}: sensitive file detected in tarball`)

  releaseManifest.push({
    name: manifest.name,
    version: manifest.version,
    tarball: tarballPath.slice(workspaceRoot.length + 1),
  })
}

writeFileSync(join(outputRoot, 'manifest.json'), `${JSON.stringify(releaseManifest, null, 2)}\n`)
process.stdout.write(`Packed and validated ${releaseManifest.length} packages in publish order.\n`)

if (dryRun || shouldPublish) {
  for (const item of releaseManifest) {
    if (shouldPublish) {
      const lookup = spawnSync('npm', ['view', `${item.name}@${item.version}`, 'version', '--registry', registry], {
        cwd: workspaceRoot,
        encoding: 'utf8',
        stdio: 'pipe',
      })
      if (lookup.status === 0 && lookup.stdout.trim() === item.version) {
        process.stdout.write(`Skipping ${item.name}@${item.version}; it is already published.\n`)
        continue
      }
    }
    const args = ['publish', join(workspaceRoot, item.tarball), '--access', 'public', '--tag', distTag, '--registry', registry]
    if (dryRun) args.push('--dry-run')
    if (shouldPublish && process.env.GITHUB_ACTIONS === 'true') args.push('--provenance')
    process.stdout.write(`${dryRun ? 'Checking' : 'Publishing'} ${item.name}@${item.version}\n`)
    run('npm', args)
  }
}

if (!dryRun && !shouldPublish) {
  process.stdout.write('Tarballs are ready. Run `pnpm release:npm:dry-run` to simulate publishing.\n')
}

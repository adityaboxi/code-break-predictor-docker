const toml = require('toml');
const { XMLParser } = require('fast-xml-parser');
const yaml = require('js-yaml');

class DependencyExtractor {
    // npm / yarn / pnpm
    static extractNpm(content, filePath) {
        const deps = [];
        try {
            const pkg = typeof content === 'string' ? JSON.parse(content) : content;
            const categories = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];
            for (const cat of categories) {
                if (pkg[cat] && typeof pkg[cat] === 'object') {
                    for (const [name, version] of Object.entries(pkg[cat])) {
                        if (name && version) {
                            deps.push({
                                name,
                                version: String(version).replace(/^[~^>=<*]/, ''),
                                versionRange: String(version),
                                ecosystem: 'npm',
                                dependencyType: cat,
                                file: filePath,
                            });
                        }
                    }
                }
            }
        } catch (err) {
            console.error('npm extract error:', err.message);
        }
        return deps;
    }

    // Python requirements.txt
    static extractPythonRequirements(content, filePath) {
        const deps = [];
        const lines = content.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const match = trimmed.match(/^([a-zA-Z0-9_\-\.]+)(?:==|>=|<=|>|<|@)(.+)$/);
                if (match) {
                    deps.push({
                        name: match[1],
                        version: match[2],
                        versionRange: trimmed,
                        ecosystem: 'pypi',
                        dependencyType: 'requirements',
                        file: filePath,
                    });
                } else if (!trimmed.includes('=') && !trimmed.includes('>') && !trimmed.includes('<')) {
                    deps.push({
                        name: trimmed,
                        version: 'latest',
                        versionRange: trimmed,
                        ecosystem: 'pypi',
                        dependencyType: 'requirements',
                        file: filePath,
                    });
                }
            }
        }
        return deps;
    }

    // Python pyproject.toml (Poetry)
    static extractPythonPoetry(content, filePath) {
        const deps = [];
        try {
            const parsed = toml.parse(content);
            if (parsed.tool?.poetry?.dependencies) {
                for (const [name, version] of Object.entries(parsed.tool.poetry.dependencies)) {
                    if (name !== 'python') {
                        deps.push({
                            name,
                            version: typeof version === 'string' ? version.replace(/[^0-9.]/g, '') : 'latest',
                            versionRange: typeof version === 'string' ? version : JSON.stringify(version),
                            ecosystem: 'pypi',
                            dependencyType: 'dependencies',
                            file: filePath,
                        });
                    }
                }
            }
        } catch (err) {
            console.error('poetry extract error:', err.message);
        }
        return deps;
    }

    // Maven pom.xml
    static extractMaven(content, filePath) {
        const deps = [];
        try {
            const parser = new XMLParser({ ignoreAttributes: false });
            const parsed = parser.parse(content);
            const dependencies = parsed?.project?.dependencies?.dependency;
            if (!dependencies) return deps;
            const depArray = Array.isArray(dependencies) ? dependencies : [dependencies];
            for (const dep of depArray) {
                if (dep && dep.groupId && dep.artifactId) {
                    deps.push({
                        name: `${dep.groupId}:${dep.artifactId}`,
                        version: dep.version || 'unknown',
                        versionRange: dep.version || 'unknown',
                        ecosystem: 'maven',
                        dependencyType: 'dependencies',
                        file: filePath,
                    });
                }
            }
        } catch (err) {
            console.error('maven extract error:', err.message);
        }
        return deps;
    }

    // Gradle build.gradle / build.gradle.kts (supports both Groovy and Kotlin DSL)
    static extractGradle(content, filePath) {
        const deps = [];
        const lines = content.split('\n');
        // Patterns for both Groovy (implementation 'group:artifact:version') and Kotlin (implementation("group:artifact:version"))
        // Also captures api, compileOnly, runtimeOnly, testImplementation, etc.
        const patterns = [
            /(?:implementation|api|compileOnly|runtimeOnly|testImplementation|androidTestImplementation|kapt)\s+['"]([^'"]+)['"]/,   // Groovy style
            /(?:implementation|api|compileOnly|runtimeOnly|testImplementation|androidTestImplementation|kapt)\s*\(\s*['"]([^'"]+)['"]\s*\)/ // Kotlin style
        ];
        for (const line of lines) {
            for (const pattern of patterns) {
                const match = line.match(pattern);
                if (match) {
                    const dependency = match[1];
                    const parts = dependency.split(':');
                    if (parts.length >= 2) {
                        deps.push({
                            name: `${parts[0]}:${parts[1]}`,
                            version: parts[2] || 'latest',
                            versionRange: parts[2] || '',
                            ecosystem: 'maven',
                            dependencyType: 'dependencies',
                            file: filePath,
                        });
                    }
                    break; // Avoid duplicate matches for the same line
                }
            }
        }
        return deps;
    }

    // Go modules
    static extractGo(content, filePath) {
        const deps = [];
        const lines = content.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('require ') || trimmed.startsWith('require (')) {
                const parts = trimmed.split(/\s+/);
                if (parts.length >= 2 && parts[0] === 'require') {
                    deps.push({
                        name: parts[1],
                        version: parts[2] || 'latest',
                        versionRange: parts[2] || '',
                        ecosystem: 'go',
                        dependencyType: 'dependencies',
                        file: filePath,
                    });
                }
            } else if (trimmed && !trimmed.startsWith('module') && !trimmed.startsWith('go ') && !trimmed.startsWith('require')) {
                const parts = trimmed.split(/\s+/);
                if (parts.length >= 2 && parts[0] && parts[1]) {
                    deps.push({
                        name: parts[0],
                        version: parts[1],
                        versionRange: parts[1],
                        ecosystem: 'go',
                        dependencyType: 'dependencies',
                        file: filePath,
                    });
                }
            }
        }
        return deps;
    }

    // Rust Cargo.toml
    static extractRust(content, filePath) {
        const deps = [];
        try {
            const parsed = toml.parse(content);
            if (parsed.dependencies) {
                for (const [name, config] of Object.entries(parsed.dependencies)) {
                    const version = typeof config === 'string' ? config : config.version;
                    if (version) {
                        deps.push({
                            name,
                            version: version.replace(/[^0-9.]/g, ''),
                            versionRange: version,
                            ecosystem: 'crates',
                            dependencyType: 'dependencies',
                            file: filePath,
                        });
                    }
                }
            }
        } catch (err) {
            console.error('cargo extract error:', err.message);
        }
        return deps;
    }

    // PHP composer.json
    static extractPhp(content, filePath) {
        const deps = [];
        try {
            const parsed = JSON.parse(content);
            if (parsed.require) {
                for (const [name, version] of Object.entries(parsed.require)) {
                    if (name !== 'php') {
                        deps.push({
                            name,
                            version: String(version).replace(/[^0-9.]/g, ''),
                            versionRange: String(version),
                            ecosystem: 'packagist',
                            dependencyType: 'dependencies',
                            file: filePath,
                        });
                    }
                }
            }
        } catch (err) {
            console.error('php extract error:', err.message);
        }
        return deps;
    }

    // Ruby Gemfile
    static extractRuby(content, filePath) {
        const deps = [];
        const lines = content.split('\n');
        const gemPattern = /gem\s+['"]([^'"]+)['"]\s*(?:,\s*['"]([^'"]+)['"])?/;
        for (const line of lines) {
            const match = line.match(gemPattern);
            if (match) {
                deps.push({
                    name: match[1],
                    version: match[2] || 'latest',
                    versionRange: match[2] || 'latest',
                    ecosystem: 'rubygems',
                    dependencyType: 'dependencies',
                    file: filePath,
                });
            }
        }
        return deps;
    }

    // .NET .csproj / .fsproj
    static extractNuGet(content, filePath) {
        const deps = [];
        try {
            const parser = new XMLParser({ ignoreAttributes: false });
            const parsed = parser.parse(content);
            const packageRefs = parsed?.Project?.ItemGroup?.PackageReference;
            if (!packageRefs) return deps;
            const refArray = Array.isArray(packageRefs) ? packageRefs : [packageRefs];
            for (const ref of refArray) {
                if (ref && ref['@_Include']) {
                    deps.push({
                        name: ref['@_Include'],
                        version: ref['@_Version'] || 'unknown',
                        versionRange: ref['@_Version'] || '',
                        ecosystem: 'nuget',
                        dependencyType: 'dependencies',
                        file: filePath,
                    });
                }
            }
        } catch (err) {
            console.error('nuget extract error:', err.message);
        }
        return deps;
    }

    // Main dispatcher
    static extract(content, filePath) {
        const fileName = filePath.toLowerCase();
        if (fileName.endsWith('package.json')) return this.extractNpm(content, filePath);
        if (fileName.endsWith('requirements.txt')) return this.extractPythonRequirements(content, filePath);
        if (fileName.endsWith('pyproject.toml')) return this.extractPythonPoetry(content, filePath);
        if (fileName.endsWith('pom.xml')) return this.extractMaven(content, filePath);
        if (fileName.endsWith('build.gradle') || fileName.endsWith('build.gradle.kts')) {
            return this.extractGradle(content, filePath);
        }
        if (fileName.endsWith('go.mod')) return this.extractGo(content, filePath);
        if (fileName.endsWith('cargo.toml')) return this.extractRust(content, filePath);
        if (fileName.endsWith('composer.json')) return this.extractPhp(content, filePath);
        if (fileName.endsWith('gemfile')) return this.extractRuby(content, filePath);
        if (fileName.endsWith('.csproj') || fileName.endsWith('.fsproj')) return this.extractNuGet(content, filePath);
        return [];
    }
}

module.exports = DependencyExtractor;
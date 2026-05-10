class LanguageDetector {
    static languagePatterns = [
        { name: 'JavaScript/TypeScript', extensions: ['.js', '.ts', '.jsx', '.tsx'], manifest: 'package.json', ecosystem: 'npm', icon: '📦' },
        { name: 'Python', extensions: ['.py'], manifest: ['requirements.txt', 'pyproject.toml', 'Pipfile'], ecosystem: 'pypi', icon: '🐍' },
        { name: 'Java/Kotlin', extensions: ['.java', '.kt'], manifest: ['pom.xml', 'build.gradle', 'build.gradle.kts'], ecosystem: 'maven', icon: '☕' },
        { name: 'Go', extensions: ['.go'], manifest: 'go.mod', ecosystem: 'go', icon: '🔵' },
        { name: 'Rust', extensions: ['.rs'], manifest: 'Cargo.toml', ecosystem: 'crates', icon: '🦀' },
        { name: 'PHP', extensions: ['.php'], manifest: 'composer.json', ecosystem: 'packagist', icon: '🐘' },
        { name: 'Ruby', extensions: ['.rb'], manifest: 'Gemfile', ecosystem: 'rubygems', icon: '💎' },
        { name: '.NET/C#', extensions: ['.cs'], manifest: ['*.csproj', 'packages.config'], ecosystem: 'nuget', icon: '🔷' }
    ];

    static detectLanguages(files) {
        const detected = new Set();
        for (const lang of this.languagePatterns) {
            const manifestFiles = Array.isArray(lang.manifest) ? lang.manifest : [lang.manifest];
            const hasManifest = manifestFiles.some(pattern => {
                if (pattern.includes('*')) {
                    const regex = new RegExp(pattern.replace('*', '.*'));
                    return files.some(f => regex.test(f));
                }
                return files.some(f => f.endsWith(pattern));
            });
            if (hasManifest) detected.add(lang.name);
        }
        return Array.from(detected);
    }

    static getEcosystemForFile(filePath) {
        for (const lang of this.languagePatterns) {
            const manifests = Array.isArray(lang.manifest) ? lang.manifest : [lang.manifest];
            if (manifests.some(m => filePath.endsWith(m) || (m.includes('*') && new RegExp(m.replace('*', '.*')).test(filePath)))) {
                return lang.ecosystem;
            }
        }
        return null;
    }

    static getLanguageInfo(languageName) {
        return this.languagePatterns.find(l => l.name === languageName);
    }
}

module.exports = LanguageDetector;

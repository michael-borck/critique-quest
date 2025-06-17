# CritiqueQuest Release Guide

## Creating a New Release

### 1. Prepare for Release
```bash
# Ensure you're on main branch and up to date
git checkout main
git pull origin main

# Run tests and build locally to verify everything works
npm ci
npm run typecheck
npm run lint
npm run build
```

### 2. Create Release Tag
```bash
# Create and push a version tag (this triggers the release workflow)
git tag v1.0.0
git push origin v1.0.0

# Or create a pre-release tag
git tag v1.0.0-beta.1
git push origin v1.0.0-beta.1
```

### 3. Automatic Build Process
The GitHub Actions workflow will automatically:
- ✅ Build for Windows (NSIS installer + ZIP)
- ✅ Build for macOS (DMG + ZIP for Intel and Apple Silicon)
- ✅ Build for Linux (AppImage + DEB package)
- ✅ Run quality checks (TypeScript, ESLint)
- ✅ Create GitHub Release with all artifacts
- ✅ Generate release notes automatically

### 4. Monitor Build Progress
1. Go to **Actions** tab in your GitHub repository
2. Watch the "Release Build" workflow
3. Build typically takes 10-15 minutes for all platforms

### 5. Release Artifacts
After successful build, the release will include:

**Windows:**
- `CritiqueQuest-Setup-1.0.0.exe` (NSIS installer)
- `CritiqueQuest-1.0.0-win.zip` (Portable version)

**macOS:**
- `CritiqueQuest-1.0.0.dmg` (Universal: Intel + Apple Silicon)
- `CritiqueQuest-1.0.0-mac.zip` (Universal: Intel + Apple Silicon)

**Linux:**
- `CritiqueQuest-1.0.0.AppImage` (Portable application)
- `CritiqueQuest-1.0.0.deb` (Debian/Ubuntu package)

## Version Numbering

Follow [Semantic Versioning](https://semver.org/):
- **Major** (v2.0.0): Breaking changes
- **Minor** (v1.1.0): New features, backward compatible
- **Patch** (v1.0.1): Bug fixes, backward compatible

### Examples:
```bash
# Major release with breaking changes
git tag v2.0.0

# Minor release with new features
git tag v1.1.0

# Patch release with bug fixes
git tag v1.0.1

# Pre-release versions
git tag v2.0.0-alpha.1
git tag v2.0.0-beta.1
git tag v2.0.0-rc.1
```

## Release Checklist

### Pre-Release
- [ ] Update version in `package.json`
- [ ] Update CHANGELOG.md with new features/fixes
- [ ] Test build locally on your development machine
- [ ] Verify all features work as expected
- [ ] Update documentation if needed

### Release Process
- [ ] Create and push version tag
- [ ] Monitor GitHub Actions workflow
- [ ] Verify all platform builds complete successfully
- [ ] Test download and installation on at least one platform

### Post-Release
- [ ] Verify GitHub Release is created with all artifacts
- [ ] Test downloaded installers work correctly
- [ ] Announce release (if applicable)
- [ ] Update any deployment documentation

## Troubleshooting

### Build Failures
- Check the Actions tab for detailed error logs
- Common issues:
  - Missing dependencies: Run `npm ci` to ensure lockfile is current
  - TypeScript errors: Run `npm run typecheck` locally first
  - Linting errors: Run `npm run lint` and fix issues

### Missing Artifacts
- Electron-builder may fail on certain platforms
- Check the workflow logs for platform-specific errors
- Consider adding platform-specific build settings if needed

## Advanced Configuration

### Code Signing (Optional)
To enable code signing for better user trust:

1. Add secrets to your GitHub repository:
   - `CSC_LINK`: Base64-encoded certificate
   - `CSC_KEY_PASSWORD`: Certificate password

2. Uncomment the environment variables in `.github/workflows/release.yml`

### Auto-Updates (Optional)
To enable automatic app updates:

1. Uncomment `GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}` in the workflow
2. Implement update checking in the Electron app
3. Configure electron-updater in your application

---

**Ready to release?** Simply create and push a version tag to trigger the automated build and release process!
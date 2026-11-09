# MIRO Android — GitHub Actions AAB build

App ID: `app.miro.browser`  
Version name: `1.5`  
Version code: `4`

## Build on GitHub

1. Create a **private** GitHub repository and upload the contents of this ZIP to its root (the `.github` folder must be at the repository root).
2. In Google Play Console, check **App integrity / App signing** and identify the existing **upload key** used for the earlier upload. Do not generate a replacement until you know whether the existing key is available and whether a reset is needed.
3. In the GitHub repository, open **Settings → Secrets and variables → Actions → New repository secret**. Add these secrets using your existing upload keystore:
   - `ANDROID_KEYSTORE_BASE64` — Base64-encoded contents of the `.jks`/`.keystore` file
   - `ANDROID_KEYSTORE_PASSWORD` — keystore password
   - `ANDROID_KEY_ALIAS` — key alias
   - `ANDROID_KEY_PASSWORD` — key password
4. Open **Actions → Build MIRO Android App Bundle → Run workflow**.
5. When the run succeeds, open the run and download the artifact named `MIRO-release-AAB-v1.5-code4`. It contains `app-release.aab`.

Never commit the keystore or passwords to the repository. If you cannot locate the upload key, stop and check the Play Console signing page before creating a new one. A newly generated key may not match the key expected for an app already registered in Play Console.

The workflow intentionally stops if signing secrets are missing; it does not create an unsigned bundle that cannot be uploaded to Play Console.

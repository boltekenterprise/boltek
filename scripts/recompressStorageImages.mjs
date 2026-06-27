#!/usr/bin/env node
/**
 * Recompress images stored in Firebase Storage to WebP at 70% quality.
 *
 * Usage:
 *   Set environment variables or pass service account path as first arg:
 *     set SERVICE_ACCOUNT=.\serviceAccountKey.json
 *     set FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
 *     node scripts/recompressStorageImages.mjs
 *
 * The script scans these Firestore collections for image URLs:
 *  - portfolio_projects (fields: image, images[])
 *  - shop_products (field: image)
 *  - blogs (field: image)
 *
 * IMPORTANT: This script overwrites files in Storage at the same path.
 * It attempts to preserve existing download token metadata.
 */

import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';
import sharp from 'sharp';

function loadDotEnv() {
  const envPath = path.resolve('.env');
  if (!fs.existsSync(envPath)) return;
  const txt = fs.readFileSync(envPath, 'utf8');
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    const val = line.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadDotEnv();

const SERVICE_ACCOUNT =
  process.env.SERVICE_ACCOUNT ||
  process.env.FIREBASE_SERVICE_ACCOUNT_FILE ||
  process.argv[2];

const BUCKET =
  process.env.FIREBASE_STORAGE_BUCKET ||
  process.env.VITE_FIREBASE_STORAGE_BUCKET;

if (!SERVICE_ACCOUNT || !BUCKET) {
  console.error('Provide SERVICE_ACCOUNT/FIREBASE_SERVICE_ACCOUNT_FILE and FIREBASE_STORAGE_BUCKET (env or arg).');
  console.error('Example PowerShell:');
  console.error('  $env:SERVICE_ACCOUNT="D:\\secrets\\serviceAccountKey.json"');
  console.error('  $env:FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"');
  console.error('  npm run recompress-images');
  console.error('Or in .env:');
  console.error('  FIREBASE_SERVICE_ACCOUNT_FILE=D:\\secrets\\serviceAccountKey.json');
  console.error('  FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com');
  process.exit(1);
}

const resolvedServiceAccountPath = path.resolve(SERVICE_ACCOUNT);
if (!fs.existsSync(resolvedServiceAccountPath)) {
  console.error(`SERVICE_ACCOUNT file not found: ${resolvedServiceAccountPath}`);
  console.error('Use the real path to your downloaded Firebase Admin SDK JSON key.');
  process.exit(1);
}

const sa = JSON.parse(fs.readFileSync(resolvedServiceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(sa),
  storageBucket: BUCKET,
});

const firestore = admin.firestore();
const bucket = admin.storage().bucket();

const COLLECTIONS = [
  { name: 'portfolio_projects', fields: ['image', 'images'] },
  { name: 'shop_products', fields: ['image'] },
  { name: 'blogs', fields: ['image'] },
];

function extractStoragePath(url) {
  try {
    const u = new URL(url);
    if (!u.hostname.includes('firebasestorage.googleapis.com')) return null;
    const parts = u.pathname.split('/o/');
    if (parts.length < 2) return null;
    const encoded = parts[1].split('?')[0];
    return decodeURIComponent(encoded);
  } catch {
    return null;
  }
}

async function processFile(storagePath, token) {
  const file = bucket.file(storagePath);
  try {
    const [exists] = await file.exists();
    if (!exists) {
      console.warn('File not found in bucket:', storagePath);
      return false;
    }

    const [buffer] = await file.download();
    const out = await sharp(buffer)
      .resize({ width: 1200, height: 1200, fit: 'inside' })
      .toFormat('webp', { quality: 70 })
      .toBuffer();

    const metadata = token
      ? { metadata: { firebaseStorageDownloadTokens: token } }
      : undefined;

    await file.save(out, {
      contentType: 'image/webp',
      metadata,
    });

    console.log('Recompressed:', storagePath);
    return true;
  } catch (err) {
    console.error('Failed processing', storagePath, err?.message || err);
    return false;
  }
}

async function main() {
  for (const col of COLLECTIONS) {
    console.log('Scanning collection', col.name);
    const snap = await firestore.collection(col.name).get();

    for (const d of snap.docs) {
      const data = d.data();
      let updated = false;

      for (const field of col.fields) {
        const val = data[field];
        if (!val) continue;

        if (Array.isArray(val)) {
          for (const url of val) {
            const storagePath = extractStoragePath(url);
            if (!storagePath) continue;

            try {
              const [meta] = await bucket.file(storagePath).getMetadata();
              const token = meta?.metadata?.firebaseStorageDownloadTokens;
              const ok = await processFile(storagePath, token);
              if (ok) updated = true;
            } catch (err) {
              console.warn('Metadata/read error for', storagePath, err?.message || err);
            }
          }
        } else if (typeof val === 'string') {
          const storagePath = extractStoragePath(val);
          if (!storagePath) continue;

          try {
            const [meta] = await bucket.file(storagePath).getMetadata();
            const token = meta?.metadata?.firebaseStorageDownloadTokens;
            const ok = await processFile(storagePath, token);
            if (ok) updated = true;
          } catch (err) {
            console.warn('Metadata/read error for', storagePath, err?.message || err);
          }
        }
      }

      if (updated) {
        console.log('Processed images for', col.name, d.id);
      }
    }
  }

  console.log('Done');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

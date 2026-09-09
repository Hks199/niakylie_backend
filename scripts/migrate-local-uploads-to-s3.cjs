const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');

const rootDir = path.resolve(__dirname, '..');
const uploadsDir = path.join(rootDir, 'public', 'uploads');
const dryRun = process.env.MIGRATE_UPLOADS !== 'true';

function loadEnvFile() {
  const envPath = path.join(rootDir, '.env');
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator < 1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

function getEnv(...names) {
  return names.map((name) => process.env[name]).find(Boolean) || '';
}

function publicPathToFile(imagePath) {
  if (typeof imagePath !== 'string' || !imagePath.startsWith('/uploads/')) return null;
  const relativePath = imagePath.slice('/uploads/'.length).replaceAll('/', path.sep);
  const filePath = path.resolve(uploadsDir, relativePath);
  if (!filePath.startsWith(`${uploadsDir}${path.sep}`) || !fs.existsSync(filePath)) return null;
  return { filePath, key: relativePath.replaceAll(path.sep, '/') };
}

function contentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === '.png') return 'image/png';
  if (extension === '.webp') return 'image/webp';
  if (extension === '.gif') return 'image/gif';
  if (extension === '.svg') return 'image/svg+xml';
  return 'image/jpeg';
}

async function main() {
  loadEnvFile();

  const mongoUri = process.env.MONGODB_URI;
  const bucket = getEnv('S3_BUCKET', 'AWS_S3_BUCKET');
  const region = getEnv('S3_REGION', 'AWS_S3_REGION') || 'ap-south-1';
  const accessKeyId = getEnv('S3_ACCESS_KEY_ID', 'AWS_ACCESS_KEY_ID');
  const secretAccessKey = getEnv('S3_SECRET_ACCESS_KEY', 'AWS_SECRET_ACCESS_KEY');

  if (!mongoUri || !bucket || !accessKeyId || !secretAccessKey) {
    throw new Error('MONGODB_URI and S3 credentials are required');
  }

  const client = new MongoClient(mongoUri);
  const s3 = new S3Client({ region, credentials: { accessKeyId, secretAccessKey } });
  const uploaded = new Map();
  let changed = 0;
  let missing = 0;

  async function migratePath(imagePath) {
    const localFile = publicPathToFile(imagePath);
    if (!localFile) {
      if (typeof imagePath === 'string' && imagePath.startsWith('/uploads/')) missing += 1;
      return imagePath;
    }

    if (uploaded.has(localFile.key)) return uploaded.get(localFile.key);

    const url = `https://${bucket}.s3.${region}.amazonaws.com/${localFile.key}`;
    console.log(`${dryRun ? '[dry-run] ' : ''}${imagePath} -> ${url}`);
    if (!dryRun) {
      await s3.send(new PutObjectCommand({
        Bucket: bucket,
        Key: localFile.key,
        Body: fs.readFileSync(localFile.filePath),
        ContentType: contentType(localFile.filePath),
      }));
    }
    uploaded.set(localFile.key, url);
    return url;
  }

  async function updateCollection(collectionName, query, transform) {
    const collection = client.db().collection(collectionName);
    const documents = await collection.find(query).toArray();
    for (const document of documents) {
      const update = await transform(document);
      if (!update) continue;
      changed += 1;
      if (!dryRun) await collection.updateOne({ _id: document._id }, { $set: update });
    }
    console.log(`${collectionName}: ${documents.length} candidate record(s)`);
  }

  try {
    await client.connect();

    await updateCollection(
      'categories',
      { $or: [{ image: /^\/uploads\// }, { banner: /^\/uploads\// }] },
      async (document) => ({
        ...(document.image?.startsWith('/uploads/') ? { image: await migratePath(document.image) } : {}),
        ...(document.banner?.startsWith('/uploads/') ? { banner: await migratePath(document.banner) } : {}),
      }),
    );

    await updateCollection(
      'brands',
      { logo: /^\/uploads\// },
      async (document) => ({ logo: await migratePath(document.logo) }),
    );

    await updateCollection(
      'products',
      { $or: [{ images: /^\/uploads\// }, { 'variants.images': /^\/uploads\// }] },
      async (document) => ({
        ...(Array.isArray(document.images)
          ? { images: await Promise.all(document.images.map(migratePath)) }
          : {}),
        ...(Array.isArray(document.variants)
          ? { variants: await Promise.all(document.variants.map(async (variant) => ({
              ...variant,
              ...(Array.isArray(variant.images)
                ? { images: await Promise.all(variant.images.map(migratePath)) }
                : {}),
            }))) }
          : {}),
      }),
    );

    await updateCollection(
      'banners',
      { $or: [{ imageUrl: /^\/uploads\// }, { mobileImageUrl: /^\/uploads\// }, { image: /^\/uploads\// }] },
      async (document) => ({
        ...(document.imageUrl?.startsWith('/uploads/') ? { imageUrl: await migratePath(document.imageUrl) } : {}),
        ...(document.mobileImageUrl?.startsWith('/uploads/') ? { mobileImageUrl: await migratePath(document.mobileImageUrl) } : {}),
        ...(document.image?.startsWith('/uploads/') ? { image: await migratePath(document.image) } : {}),
      }),
    );

    console.log(`${dryRun ? 'Dry-run complete' : 'Migration complete'}: ${changed} record(s), ${uploaded.size} file(s), ${missing} missing local file(s).`);
    if (dryRun) console.log('Run with MIGRATE_UPLOADS=true to upload files and update MongoDB.');
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

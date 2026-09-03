import crypto from 'crypto';
import { getPool, closePool } from '../infrastructure/database/pool.js';

function deterministicUuid(seed: string): string {
  const hash = crypto.createHash('sha256').update(seed).digest('hex');
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    '4' + hash.slice(13, 16),
    ((parseInt(hash.slice(16, 18), 16) & 0x3f) | 0x80).toString(16) + hash.slice(18, 20),
    hash.slice(20, 32),
  ].join('-');
}

function generateEmbedding(seed: string, dimensions = 768): number[] {
  const embedding: number[] = [];
  let s = crypto.createHash('sha256').update(seed).digest();
  for (let i = 0; i < dimensions; i++) {
    const byte = s[i % s.length];
    embedding.push((byte / 255) * 2 - 1);
    if ((i + 1) % 32 === 0) {
      s = crypto.createHash('sha256').update(s).digest();
    }
  }
  const mag = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
  return embedding.map(v => v / mag);
}

function shiftEmbedding(base: number[], offset: number): number[] {
  const shifted = base.map(v => v + (Math.sin(offset * v) * 0.3));
  const mag = Math.sqrt(shifted.reduce((sum, v) => sum + v * v, 0));
  return shifted.map(v => v / mag);
}

interface ImageData {
  id: string;
  filename: string;
  category: string;
  subject: string;
  caption: string;
  attributes: string[];
  confidence: number;
}

const foxImages: ImageData[] = [
  { id: '', filename: 'red-fox-01.jpg', category: 'animal', subject: 'red fox', caption: 'A red fox standing in a snowy field', attributes: ['orange fur', 'bushy tail', 'wild'], confidence: 0.95 },
  { id: '', filename: 'red-fox-02.jpg', category: 'animal', subject: 'red fox', caption: 'A red fox hunting in autumn forest', attributes: ['fox', 'predator', 'forest'], confidence: 0.92 },
  { id: '', filename: 'red-fox-03.jpg', category: 'animal', subject: 'red fox', caption: 'Close-up of a red fox face', attributes: ['fox', 'portrait', 'sharp features'], confidence: 0.97 },
  { id: '', filename: 'red-fox-04.jpg', category: 'animal', subject: 'red fox', caption: 'A red fox jumping over a log', attributes: ['fox', 'agile', 'jumping'], confidence: 0.90 },
  { id: '', filename: 'red-fox-05.jpg', category: 'animal', subject: 'red fox', caption: 'A red fox resting in tall grass', attributes: ['fox', 'resting', 'nature'], confidence: 0.93 },
  { id: '', filename: 'red-fox-06.jpg', category: 'animal', subject: 'red fox', caption: 'A red fox with kit in spring meadow', attributes: ['fox', 'family', 'meadow'], confidence: 0.91 },
  { id: '', filename: 'red-fox-07.jpg', category: 'animal', subject: 'red fox', caption: 'Red fox in winter landscape with snow', attributes: ['fox', 'winter', 'snow'], confidence: 0.94 },
  { id: '', filename: 'red-fox-08.jpg', category: 'animal', subject: 'red fox', caption: 'Arctic fox in white winter coat', attributes: ['fox', 'arctic', 'white fur'], confidence: 0.88 },
  { id: '', filename: 'red-fox-09.jpg', category: 'animal', subject: 'red fox', caption: 'Red fox at dusk in woodland', attributes: ['fox', 'dusk', 'woodland'], confidence: 0.89 },
  { id: '', filename: 'red-fox-10.jpg', category: 'animal', subject: 'red fox', caption: 'Red fox pouncing on prey in snow', attributes: ['fox', 'hunting', 'pounce'], confidence: 0.96 },
];

const wolfImages: ImageData[] = [
  { id: '', filename: 'gray-wolf-01.jpg', category: 'animal', subject: 'gray wolf', caption: 'A gray wolf howling at the moon', attributes: ['wolf', 'howling', 'night'], confidence: 0.94 },
  { id: '', filename: 'gray-wolf-02.jpg', category: 'animal', subject: 'gray wolf', caption: 'Wolf pack running through snowy terrain', attributes: ['wolf', 'pack', 'running'], confidence: 0.91 },
  { id: '', filename: 'gray-wolf-03.jpg', category: 'animal', subject: 'gray wolf', caption: 'Close-up of a gray wolf with piercing eyes', attributes: ['wolf', 'portrait', 'eyes'], confidence: 0.96 },
  { id: '', filename: 'gray-wolf-04.jpg', category: 'animal', subject: 'gray wolf', caption: 'Gray wolf in forest setting', attributes: ['wolf', 'forest', 'wild'], confidence: 0.89 },
  { id: '', filename: 'gray-wolf-05.jpg', category: 'animal', subject: 'gray wolf', caption: 'Alpha wolf leading pack through mountains', attributes: ['wolf', 'alpha', 'mountains'], confidence: 0.93 },
  { id: '', filename: 'gray-wolf-06.jpg', category: 'animal', subject: 'gray wolf', caption: 'Wolf pup playing in meadow', attributes: ['wolf', 'pup', 'playful'], confidence: 0.87 },
  { id: '', filename: 'gray-wolf-07.jpg', category: 'animal', subject: 'gray wolf', caption: 'Gray wolf in winter tundra', attributes: ['wolf', 'tundra', 'winter'], confidence: 0.90 },
  { id: '', filename: 'gray-wolf-08.jpg', category: 'animal', subject: 'gray wolf', caption: 'Gray wolf stalking prey at dawn', attributes: ['wolf', 'hunting', 'dawn'], confidence: 0.92 },
];

const dogImages: ImageData[] = [
  { id: '', filename: 'golden-retriever-01.jpg', category: 'animal', subject: 'golden retriever', caption: 'Golden retriever playing fetch in park', attributes: ['dog', 'retriever', 'playful'], confidence: 0.96 },
  { id: '', filename: 'golden-retriever-02.jpg', category: 'animal', subject: 'golden retriever', caption: 'Golden retriever puppy with ball', attributes: ['dog', 'puppy', 'cute'], confidence: 0.94 },
  { id: '', filename: 'labrador-01.jpg', category: 'animal', subject: 'labrador retriever', caption: 'Chocolate labrador swimming in lake', attributes: ['dog', 'labrador', 'swimming'], confidence: 0.93 },
  { id: '', filename: 'beagle-01.jpg', category: 'animal', subject: 'beagle', caption: 'Beagle sniffing in garden', attributes: ['dog', 'beagle', 'scent'], confidence: 0.91 },
  { id: '', filename: 'german-shepherd-01.jpg', category: 'animal', subject: 'german shepherd', caption: 'German shepherd standing alert', attributes: ['dog', 'shepherd', 'alert'], confidence: 0.95 },
  { id: '', filename: 'border-collie-01.jpg', category: 'animal', subject: 'border collie', caption: 'Border collie herding sheep', attributes: ['dog', 'collie', 'herding'], confidence: 0.92 },
  { id: '', filename: 'poodle-01.jpg', category: 'animal', subject: 'poodle', caption: 'Standard poodle at dog show', attributes: ['dog', 'poodle', 'elegant'], confidence: 0.90 },
  { id: '', filename: 'husky-01.jpg', category: 'animal', subject: 'siberian husky', caption: 'Siberian husky in snowy landscape', attributes: ['dog', 'husky', 'snow'], confidence: 0.94 },
  { id: '', filename: 'corgi-01.jpg', category: 'animal', subject: 'corgi', caption: 'Pembroke corgi in flower field', attributes: ['dog', 'corgi', 'flowers'], confidence: 0.93 },
  { id: '', filename: 'dalmatian-01.jpg', category: 'animal', subject: 'dalmatian', caption: 'Dalmatian running on beach', attributes: ['dog', 'dalmatian', 'beach'], confidence: 0.91 },
];

const bearImages: ImageData[] = [
  { id: '', filename: 'black-bear-01.jpg', category: 'animal', subject: 'black bear', caption: 'Black bear foraging for berries', attributes: ['bear', 'foraging', 'berries'], confidence: 0.94 },
  { id: '', filename: 'brown-bear-01.jpg', category: 'animal', subject: 'brown bear', caption: 'Brown bear catching salmon in river', attributes: ['bear', 'fishing', 'salmon'], confidence: 0.96 },
  { id: '', filename: 'grizzly-bear-01.jpg', category: 'animal', subject: 'grizzly bear', caption: 'Grizzly bear standing on hind legs', attributes: ['bear', 'standing', 'powerful'], confidence: 0.93 },
  { id: '', filename: 'polar-bear-01.jpg', category: 'animal', subject: 'polar bear', caption: 'Polar bear on Arctic ice', attributes: ['bear', 'arctic', 'ice'], confidence: 0.95 },
  { id: '', filename: 'black-bear-02.jpg', category: 'animal', subject: 'black bear', caption: 'Black bear climbing tree', attributes: ['bear', 'climbing', 'tree'], confidence: 0.91 },
];

const deerImages: ImageData[] = [
  { id: '', filename: 'white-tailed-deer-01.jpg', category: 'animal', subject: 'white-tailed deer', caption: 'White-tailed deer in autumn forest', attributes: ['deer', 'autumn', 'forest'], confidence: 0.95 },
  { id: '', filename: 'elk-01.jpg', category: 'animal', subject: 'elk', caption: 'Bull elk with large antlers', attributes: ['deer', 'elk', 'antlers'], confidence: 0.93 },
  { id: '', filename: 'white-tailed-deer-02.jpg', category: 'animal', subject: 'white-tailed deer', caption: 'Deer fawn in spring meadow', attributes: ['deer', 'fawn', 'meadow'], confidence: 0.92 },
  { id: '', filename: 'moose-01.jpg', category: 'animal', subject: 'moose', caption: 'Moose in mountain lake', attributes: ['deer', 'moose', 'lake'], confidence: 0.94 },
  { id: '', filename: 'white-tailed-deer-03.jpg', category: 'animal', subject: 'white-tailed deer', caption: 'Deer herd crossing road at dusk', attributes: ['deer', 'herd', 'dusk'], confidence: 0.90 },
];

async function seedImages() {
  console.log('=== Seeding Relevix Image Data ===\n');

  const pool = getPool();

  const allImages = [
    ...foxImages.map(img => ({ ...img, id: deterministicUuid(img.filename) })),
    ...wolfImages.map(img => ({ ...img, id: deterministicUuid(img.filename) })),
    ...dogImages.map(img => ({ ...img, id: deterministicUuid(img.filename) })),
    ...bearImages.map(img => ({ ...img, id: deterministicUuid(img.filename) })),
    ...deerImages.map(img => ({ ...img, id: deterministicUuid(img.filename) })),
  ];

  console.log(`Inserting ${allImages.length} images...\n`);

  for (const img of allImages) {
    const existing = await pool.query('SELECT id FROM images WHERE id = $1', [img.id]);
    if (existing.rows.length === 0) {
      await pool.query(
        `INSERT INTO images (id, filename, original_path, mime_type)
         VALUES ($1, $2, $3, $4)`,
        [img.id, img.filename, `/images/${img.filename}`, 'image/jpeg']
      );

      await pool.query(
        `INSERT INTO image_metadata (id, image_id, subject, category, attributes, caption, confidence, vision_model)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          deterministicUuid(`meta-${img.filename}`),
          img.id,
          img.subject,
          img.category,
          JSON.stringify(img.attributes),
          img.caption,
          img.confidence,
          'mock-gemini-flash',
        ]
      );

      const embedding = generateEmbedding(img.filename);
      await pool.query(
        `INSERT INTO image_vectors (id, image_id, embedding, embedding_model, embedding_dimension)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          deterministicUuid(`vec-${img.filename}`),
          img.id,
          `[${embedding.join(',')}]`,
          'mock-text-embedding-004',
          768,
        ]
      );

      console.log(`  Inserted: ${img.filename} (${img.subject})`);
    } else {
      console.log(`  Already exists: ${img.filename}`);
    }
  }

  console.log('\nImage seeding complete!');
  console.log(`Total images: ${allImages.length}`);

  await closePool();
}

seedImages().catch((err) => {
  console.error('Image seeding failed:', err);
  process.exit(1);
});

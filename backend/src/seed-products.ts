import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { Item, SaleMode, ItemStatus } from './items/entities/item.entity';
import { ItemPhoto } from './items/entities/item-photo.entity';
import { Category } from './categories/entities/category.entity';
import { User } from './users/entities/user.entity';

// Lorem Picsum API: https://picsum.photos/
// Format: https://picsum.photos/width/height?random=id
const LOREM_PICSUM_BASE_URL = 'https://picsum.photos';

interface ProductData {
  name: string;
  description: string;
  price_desired: number;
  price_min: number;
  sale_mode: SaleMode;
  status: ItemStatus;
  width_cm: number;
  height_cm: number;
  depth_cm: number;
  weight_kg: number;
  categoryName: string;
  imageCount: number; // Nombre d'images à générer
  auction_start_price?: number;
  min_amount_bid?: number;
}

const PRODUCTS: ProductData[] = [
  {
    name: 'Tableau moderne abstrait',
    description: 'Magnifique tableau abstrait aux couleurs vives, parfait pour égayer votre intérieur.',
    price_desired: 450,
    price_min: 350,
    sale_mode: SaleMode.FIXED,
    status: ItemStatus.PUBLISHED,
    width_cm: 80,
    height_cm: 60,
    depth_cm: 3,
    weight_kg: 2.5,
    categoryName: 'Art',
    imageCount: 3,
  },
  {
    name: 'Vase céramique design',
    description: 'Vase en céramique au design contemporain, idéal pour la décoration moderne.',
    price_desired: 120,
    price_min: 90,
    sale_mode: SaleMode.FIXED,
    status: ItemStatus.PUBLISHED,
    width_cm: 25,
    height_cm: 40,
    depth_cm: 25,
    weight_kg: 1.2,
    categoryName: 'Décoration',
    imageCount: 2,
  },
  {
    name: 'Montre vintage élégante',
    description: 'Montre vintage en excellent état, mécanisme suisse authentique.',
    price_desired: 850,
    price_min: 700,
    sale_mode: SaleMode.AUCTION,
    status: ItemStatus.PUBLISHED,
    width_cm: 4,
    height_cm: 1,
    depth_cm: 1.5,
    weight_kg: 0.1,
    categoryName: 'Montres',
    imageCount: 4,
    auction_start_price: 500,
    min_amount_bid: 1000,
  },
  {
    name: 'Sac à main cuir premium',
    description: 'Sac à main en cuir véritable, fabrication artisanale italienne.',
    price_desired: 320,
    price_min: 250,
    sale_mode: SaleMode.FIXED,
    status: ItemStatus.PUBLISHED,
    width_cm: 35,
    height_cm: 28,
    depth_cm: 15,
    weight_kg: 0.8,
    categoryName: 'Mode',
    imageCount: 3,
  },
  {
    name: 'Lampe design scandinave',
    description: 'Lampe design scandinave en bois et métal, éclairage LED intégré.',
    price_desired: 180,
    price_min: 140,
    sale_mode: SaleMode.NEGOTIABLE,
    status: ItemStatus.PUBLISHED,
    width_cm: 30,
    height_cm: 50,
    depth_cm: 30,
    weight_kg: 2.0,
    categoryName: 'Décoration',
    imageCount: 2,
  },
  {
    name: 'Collier perles fines',
    description: 'Collier de perles fines, longueur ajustable, écrin inclus.',
    price_desired: 280,
    price_min: 220,
    sale_mode: SaleMode.FIXED,
    status: ItemStatus.PUBLISHED,
    width_cm: 45,
    height_cm: 1,
    depth_cm: 1,
    weight_kg: 0.05,
    categoryName: 'Joaillerie',
    imageCount: 3,
  },
  {
    name: 'Sculpture bronze moderne',
    description: 'Sculpture en bronze représentant une forme abstraite moderne.',
    price_desired: 650,
    price_min: 500,
    sale_mode: SaleMode.FIXED,
    status: ItemStatus.PUBLISHED,
    width_cm: 20,
    height_cm: 35,
    depth_cm: 20,
    weight_kg: 4.5,
    categoryName: 'Art',
    imageCount: 4,
  },
  {
    name: 'Robe vintage années 70',
    description: 'Robe vintage des années 70, style bohème, taille unique.',
    price_desired: 95,
    price_min: 70,
    sale_mode: SaleMode.FIXED,
    status: ItemStatus.PUBLISHED,
    width_cm: 45,
    height_cm: 110,
    depth_cm: 3,
    weight_kg: 0.5,
    categoryName: 'Mode',
    imageCount: 2,
  },
  {
    name: 'Miroir art déco',
    description: 'Miroir style art déco, cadre doré, dimensions généreuses.',
    price_desired: 420,
    price_min: 350,
    sale_mode: SaleMode.AUCTION,
    status: ItemStatus.PUBLISHED,
    width_cm: 100,
    height_cm: 80,
    depth_cm: 5,
    weight_kg: 6.0,
    categoryName: 'Décoration',
    imageCount: 3,
    auction_start_price: 300,
    min_amount_bid: 500,
  },
  {
    name: 'Bague diamant solitaire',
    description: 'Bague en or blanc sertie d\'un diamant solitaire, certificat inclus.',
    price_desired: 2500,
    price_min: 2000,
    sale_mode: SaleMode.AUCTION,
    status: ItemStatus.PENDING_EXPERTISE,
    width_cm: 2,
    height_cm: 2,
    depth_cm: 2,
    weight_kg: 0.01,
    categoryName: 'Bagues',
    imageCount: 5,
    auction_start_price: 1500,
    min_amount_bid: 3000,
  },
];

function getLoremPicsumUrl(width: number, height: number, seed?: number): string {
  const seedParam = seed ? `?random=${seed}` : '';
  return `${LOREM_PICSUM_BASE_URL}/${width}/${height}${seedParam}`;
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log('🌱 Starting product seed with Lorem Picsum images...\n');

  try {
    // 1. Get sellers (professional users)
    console.log('👤 Fetching sellers...');
    const sellers = await dataSource
      .getRepository(User)
      .find({ where: { role: 'professional' } });

    if (sellers.length === 0) {
      console.error('❌ No professional users found. Please run the seed script first to create sellers.');
      await app.close();
      return;
    }
    console.log(`✅ Found ${sellers.length} seller(s)\n`);

    // 2. Get or create categories
    console.log('📁 Fetching or creating categories...');
    const categoryRepository = dataSource.getRepository(Category);
    const categoryMap = new Map<string, Category>();
    
    // Get all unique category names from products
    const uniqueCategoryNames = [...new Set(PRODUCTS.map(p => p.categoryName))];
    
    for (const categoryName of uniqueCategoryNames) {
      let category = await categoryRepository.findOne({
        where: { name: categoryName },
      });
      
      if (!category) {
        // Create category if it doesn't exist
        category = categoryRepository.create({
          name: categoryName,
          is_default: false,
        });
        category = await categoryRepository.save(category);
        console.log(`✅ Created category: ${categoryName}`);
      } else {
        console.log(`✅ Found category: ${categoryName}`);
      }
      
      categoryMap.set(categoryName, category);
    }
    console.log(`\n✅ ${categoryMap.size} categories ready\n`);

    // 3. Create products
    console.log('📦 Creating products with Lorem Picsum images...\n');
    const itemRepository = dataSource.getRepository(Item);
    const photoRepository = dataSource.getRepository(ItemPhoto);

    let createdCount = 0;
    let skippedCount = 0;

    for (const productData of PRODUCTS) {
      // Get category (should always exist as we created them above)
      const category = categoryMap.get(productData.categoryName);
      if (!category) {
        console.log(`⚠️  Category "${productData.categoryName}" not found, skipping: ${productData.name}`);
        skippedCount++;
        continue;
      }

      // Select a random seller
      const seller = sellers[Math.floor(Math.random() * sellers.length)];

      // Check if item already exists (by name and seller)
      const existingItem = await itemRepository.findOne({
        where: {
          name: productData.name,
          seller_id: seller.id,
        },
      });

      if (existingItem) {
        console.log(`⏭️  Skipping existing item: ${productData.name}`);
        skippedCount++;
        continue;
      }

      // Create item
      const item = itemRepository.create({
        seller_id: seller.id,
        category_id: category.id,
        name: productData.name,
        description: productData.description,
        width_cm: productData.width_cm,
        height_cm: productData.height_cm,
        depth_cm: productData.depth_cm,
        weight_kg: productData.weight_kg,
        price_desired: productData.price_desired,
        price_min: productData.price_min,
        sale_mode: productData.sale_mode,
        status: productData.status,
        auction_start_price: productData.auction_start_price,
        min_amount_bid: productData.min_amount_bid,
      });

      const savedItem = await itemRepository.save(item);
      console.log(`✅ Created item: ${productData.name} (ID: ${savedItem.id})`);

      // Create photos with Lorem Picsum URLs
      const photos: ItemPhoto[] = [];
      for (let i = 0; i < productData.imageCount; i++) {
        // Generate different images using seed (item ID + photo index)
        const seed = savedItem.id * 100 + i;
        const imageUrl = getLoremPicsumUrl(800, 600, seed);

        const photo = photoRepository.create({
          item_id: savedItem.id,
          url: imageUrl,
          position: i,
          is_primary: i === 0, // First photo is primary
        });

        photos.push(photo);
      }

      await photoRepository.save(photos);
      console.log(`   📸 Added ${photos.length} photo(s) with Lorem Picsum URLs`);

      // Link item to category
      await dataSource.query(
        `INSERT INTO item_categories (item_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [savedItem.id, category.id],
      );

      createdCount++;
    }

    console.log('\n✅ Product seed completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - ${createdCount} products created`);
    console.log(`   - ${skippedCount} products skipped (already exist or category not found)`);
    console.log(`   - All products have images from Lorem Picsum API`);

  } catch (error) {
    console.error('❌ Error seeding products:', error);
    console.error(error.stack);
  } finally {
    await app.close();
  }
}

bootstrap();


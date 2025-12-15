import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log('🌱 Starting database seed...');

  try {
    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Create users
    console.log('\n👤 Creating users...');
    
    // Get or create users
    let [buyer1] = await dataSource.query(`SELECT id FROM users WHERE email = $1`, ['marie.dupont@example.com']);
    if (!buyer1) {
      [buyer1] = await dataSource.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, role, age, address_line, city, postal_code, country, is_verified, rgpd_accepted)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id
      `, ['marie.dupont@example.com', hashedPassword, 'Marie', 'Dupont', 'particular', 28, '15 Rue de la Paix', 'Paris', '75002', 'France', true, true]);
      console.log('✅ Created buyer: Marie Dupont');
    } else {
      console.log('✅ Found buyer: Marie Dupont');
    }

    let [buyer2] = await dataSource.query(`SELECT id FROM users WHERE email = $1`, ['lucas.martin@example.com']);
    if (!buyer2) {
      [buyer2] = await dataSource.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, role, age, address_line, city, postal_code, country, is_verified, rgpd_accepted)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id
      `, ['lucas.martin@example.com', hashedPassword, 'Lucas', 'Martin', 'particular', 32, '42 Avenue des Champs-Élysées', 'Paris', '75008', 'France', true, true]);
      console.log('✅ Created buyer: Lucas Martin');
    } else {
      console.log('✅ Found buyer: Lucas Martin');
    }

    let [seller1] = await dataSource.query(`SELECT id FROM users WHERE email = $1`, ['sophie.vintage@example.com']);
    if (!seller1) {
      [seller1] = await dataSource.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, role, company_name, siret, address_line, city, postal_code, country, speciality, items_preference, is_verified, rgpd_accepted)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id
      `, ['sophie.vintage@example.com', hashedPassword, 'Sophie', 'Vintage', 'professional', 'Sophie Vintage Shop', '12345678901234', '25 Rue du Commerce', 'Lyon', '69001', 'France', 'Mode vintage', 'Vêtements et accessoires', true, true]);
      console.log('✅ Created seller: Sophie Vintage (Pro)');
    } else {
      console.log('✅ Found seller: Sophie Vintage (Pro)');
    }

    let [seller2] = await dataSource.query(`SELECT id FROM users WHERE email = $1`, ['thomas.design@example.com']);
    if (!seller2) {
      [seller2] = await dataSource.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, role, company_name, siret, address_line, city, postal_code, country, speciality, items_preference, is_verified, rgpd_accepted)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id
      `, ['thomas.design@example.com', hashedPassword, 'Thomas', 'Design', 'professional', 'Thomas Design Studio', '98765432109876', '8 Boulevard Saint-Germain', 'Marseille', '13001', 'France', 'Art et décoration', 'Œuvres d\'art et objets design', true, true]);
      console.log('✅ Created seller: Thomas Design (Pro)');
    } else {
      console.log('✅ Found seller: Thomas Design (Pro)');
    }

    // Create admin user
    let [admin] = await dataSource.query(`SELECT id FROM users WHERE email = $1`, ['admin@purpledog.com']);
    if (!admin) {
      [admin] = await dataSource.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, role, address_line, city, postal_code, country, is_verified, rgpd_accepted)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id
      `, ['admin@purpledog.com', hashedPassword, 'Admin', 'PurpleDog', 'admin', '1 Place de la République', 'Paris', '75003', 'France', true, true]);
      console.log('✅ Created admin: Admin PurpleDog');
    } else {
      console.log('✅ Found admin: Admin PurpleDog');
    }

    // 2. Find or create categories
    console.log('\n📁 Getting categories...');
    
    let [modeCategory] = await dataSource.query(`SELECT id FROM categories WHERE name = 'Mode' LIMIT 1`);
    if (!modeCategory) {
      [modeCategory] = await dataSource.query(`INSERT INTO categories (name, is_default) VALUES ('Mode', false) RETURNING id`);
      console.log('✅ Created category: Mode');
    } else {
      console.log('✅ Found category: Mode');
    }

    let [artCategory] = await dataSource.query(`SELECT id FROM categories WHERE name = 'Art' LIMIT 1`);
    if (!artCategory) {
      [artCategory] = await dataSource.query(`INSERT INTO categories (name, is_default) VALUES ('Art', false) RETURNING id`);
      console.log('✅ Created category: Art');
    } else {
      console.log('✅ Found category: Art');
    }

    let [decorCategory] = await dataSource.query(`SELECT id FROM categories WHERE name = 'Décoration' LIMIT 1`);
    if (!decorCategory) {
      [decorCategory] = await dataSource.query(`INSERT INTO categories (name, is_default) VALUES ('Décoration', false) RETURNING id`);
      console.log('✅ Created category: Décoration');
    } else {
      console.log('✅ Found category: Décoration');
    }

    let [joaillerieCategory] = await dataSource.query(`SELECT id FROM categories WHERE name = 'Joaillerie' LIMIT 1`);
    if (!joaillerieCategory) {
      [joaillerieCategory] = await dataSource.query(`INSERT INTO categories (name, is_default) VALUES ('Joaillerie', false) RETURNING id`);
      console.log('✅ Created category: Joaillerie');
    } else {
      console.log('✅ Found category: Joaillerie');
    }

    // Get or create subcategories for Joaillerie
    let [baguesCategory] = await dataSource.query(`SELECT id FROM categories WHERE name = 'Bagues' LIMIT 1`);
    if (!baguesCategory) {
      [baguesCategory] = await dataSource.query(`INSERT INTO categories (name, parent_id, is_default) VALUES ('Bagues', $1, false) RETURNING id`, [joaillerieCategory.id]);
      console.log('✅ Created subcategory: Bagues');
    } else {
      console.log('✅ Found subcategory: Bagues');
    }

    let [montresCategory] = await dataSource.query(`SELECT id FROM categories WHERE name = 'Montres' LIMIT 1`);
    if (!montresCategory) {
      [montresCategory] = await dataSource.query(`INSERT INTO categories (name, parent_id, is_default) VALUES ('Montres', $1, false) RETURNING id`, [joaillerieCategory.id]);
      console.log('✅ Created subcategory: Montres');
    } else {
      console.log('✅ Found subcategory: Montres');
    }

    // 3. Create items
    console.log('\n📦 Creating items...');

    // Mode items
    const [item1] = await dataSource.query(`
      INSERT INTO items (name, description, price_desired, price_min, sale_mode, status, width_cm, height_cm, depth_cm, weight_kg, seller_id, category_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT DO NOTHING RETURNING id
    `, ['Veste en cuir vintage', 'Belle veste en cuir véritable des années 80, excellent état. Taille 44 EU', 120.00, 100.00, 'fixed', 'published', 50, 70, 5, 1.2, seller1.id, modeCategory.id]);
    if (item1) console.log('✅ Created item: Veste en cuir vintage');

    const [item2] = await dataSource.query(`
      INSERT INTO items (name, description, price_desired, price_min, sale_mode, status, width_cm, height_cm, depth_cm, weight_kg, seller_id, category_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT DO NOTHING RETURNING id
    `, ['Sac à main Hermès vintage', 'Authentique sac Hermès Birkin, cuir Togo, certificat d\'authenticité. Taille 35cm', 4500.00, 4000.00, 'fixed', 'pending_expertise', 35, 25, 18, 1.0, seller1.id, modeCategory.id]);
    if (item2) console.log('✅ Created item: Sac à main Hermès vintage');

    const [item3] = await dataSource.query(`
      INSERT INTO items (name, description, price_desired, price_min, sale_mode, status, width_cm, height_cm, depth_cm, weight_kg, seller_id, category_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT DO NOTHING RETURNING id
    `, ['Robe Chanel années 60', 'Magnifique robe Chanel en tweed, taille 38, état impeccable avec son étiquette d\'origine', 1800.00, 1500.00, 'fixed', 'published', 40, 110, 2, 0.8, seller1.id, modeCategory.id]);
    if (item3) console.log('✅ Created item: Robe Chanel années 60');

    const [item4] = await dataSource.query(`
      INSERT INTO items (name, description, price_desired, price_min, sale_mode, status, width_cm, height_cm, depth_cm, weight_kg, seller_id, category_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT DO NOTHING RETURNING id
    `, ['Boots cuir italien', 'Boots en cuir italien fait main, pointure 42, style vintage années 70', 280.00, 220.00, 'fixed', 'published', 28, 35, 12, 1.5, seller1.id, modeCategory.id]);
    if (item4) console.log('✅ Created item: Boots cuir italien');

    // Art items
    const [item5] = await dataSource.query(`
      INSERT INTO items (name, description, price_desired, price_min, sale_mode, status, width_cm, height_cm, depth_cm, weight_kg, seller_id, category_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT DO NOTHING RETURNING id
    `, ['Tableau abstrait moderne', 'Peinture acrylique sur toile, œuvre originale signée. Dimensions: 80x60 cm', 350.00, 280.00, 'fixed', 'published', 80, 60, 2, 1.5, seller2.id, artCategory.id]);
    if (item5) console.log('✅ Created item: Tableau abstrait moderne');

    const [item6] = await dataSource.query(`
      INSERT INTO items (name, description, price_desired, price_min, sale_mode, status, width_cm, height_cm, depth_cm, weight_kg, seller_id, category_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT DO NOTHING RETURNING id
    `, ['Sculpture bronze signée', 'Sculpture en bronze représentant un danseur, signée par l\'artiste. Hauteur: 30cm', 890.00, 750.00, 'fixed', 'published', 15, 30, 15, 5.0, seller2.id, artCategory.id]);
    if (item6) console.log('✅ Created item: Sculpture bronze signée');

    const [item7] = await dataSource.query(`
      INSERT INTO items (name, description, price_desired, price_min, sale_mode, status, width_cm, height_cm, depth_cm, weight_kg, seller_id, category_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT DO NOTHING RETURNING id
    `, ['Lithographie Picasso', 'Lithographie originale de Picasso, édition limitée numérotée 45/100, avec certificat', 2400.00, 2000.00, 'fixed', 'published', 50, 65, 1, 0.5, seller2.id, artCategory.id]);
    if (item7) console.log('✅ Created item: Lithographie Picasso');

    const [item8] = await dataSource.query(`
      INSERT INTO items (name, description, price_desired, price_min, sale_mode, status, width_cm, height_cm, depth_cm, weight_kg, seller_id, category_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT DO NOTHING RETURNING id
    `, ['Vase céramique Art Déco', 'Superbe vase en céramique époque Art Déco, signé Longwy, hauteur 40cm', 580.00, 480.00, 'fixed', 'published', 20, 40, 20, 2.5, seller2.id, artCategory.id]);
    if (item8) console.log('✅ Created item: Vase céramique Art Déco');

    // Décoration items
    const [item9] = await dataSource.query(`
      INSERT INTO items (name, description, price_desired, price_min, sale_mode, status, width_cm, height_cm, depth_cm, weight_kg, seller_id, category_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT DO NOTHING RETURNING id
    `, ['Lampe industrielle vintage', 'Lampe style industriel, métal et laiton, années 70. Hauteur: 45cm', 85.00, 70.00, 'fixed', 'published', 20, 45, 20, 2.5, seller1.id, decorCategory.id]);
    if (item9) console.log('✅ Created item: Lampe industrielle vintage');

    const [item10] = await dataSource.query(`
      INSERT INTO items (name, description, price_desired, price_min, sale_mode, status, width_cm, height_cm, depth_cm, weight_kg, seller_id, category_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT DO NOTHING RETURNING id
    `, ['Miroir vénitien ancien', 'Magnifique miroir vénitien du XIXe siècle, verre gravé à la main. Dimensions: 90x70 cm', 650.00, 550.00, 'fixed', 'published', 90, 70, 5, 8.0, seller1.id, decorCategory.id]);
    if (item10) console.log('✅ Created item: Miroir vénitien ancien');

    const [item11] = await dataSource.query(`
      INSERT INTO items (name, description, price_desired, price_min, sale_mode, status, width_cm, height_cm, depth_cm, weight_kg, seller_id, category_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT DO NOTHING RETURNING id
    `, ['Horloge murale vintage', 'Horloge murale ancienne mécanisme à balancier, bois massif, fonctionne parfaitement', 320.00, 280.00, 'fixed', 'published', 30, 80, 15, 4.0, seller1.id, decorCategory.id]);
    if (item11) console.log('✅ Created item: Horloge murale vintage');

    const [item12] = await dataSource.query(`
      INSERT INTO items (name, description, price_desired, price_min, sale_mode, status, width_cm, height_cm, depth_cm, weight_kg, seller_id, category_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT DO NOTHING RETURNING id
    `, ['Lustre cristal Baccarat', 'Lustre en cristal Baccarat à 8 branches, pampilles d\'origine, hauteur 70cm', 3200.00, 2800.00, 'fixed', 'published', 60, 70, 60, 12.0, seller2.id, decorCategory.id]);
    if (item12) console.log('✅ Created item: Lustre cristal Baccarat');

    const [item13] = await dataSource.query(`
      INSERT INTO items (name, description, price_desired, price_min, sale_mode, status, width_cm, height_cm, depth_cm, weight_kg, seller_id, category_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT DO NOTHING RETURNING id
    `, ['Tapis persan ancien', 'Authentique tapis persan fait main, 200x300cm, laine naturelle, motifs traditionnels', 1950.00, 1700.00, 'fixed', 'published', 200, 300, 1, 15.0, seller1.id, decorCategory.id]);
    if (item13) console.log('✅ Created item: Tapis persan ancien');

    // Joaillerie items - Montres
    const [item14] = await dataSource.query(`
      INSERT INTO items (name, description, price_desired, price_min, sale_mode, status, width_cm, height_cm, depth_cm, weight_kg, seller_id, category_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT DO NOTHING RETURNING id
    `, ['Montre Rolex Submariner', 'Authentique Rolex Submariner, acier inoxydable, automatique, avec boîte et papiers', 8500.00, 8000.00, 'negotiable', 'pending_expertise', 4, 1, 1.5, 0.15, seller1.id, montresCategory.id]);
    if (item14) console.log('✅ Created item: Montre Rolex Submariner');

    // Joaillerie items - General (parent category)
    const [item15] = await dataSource.query(`
      INSERT INTO items (name, description, price_desired, price_min, sale_mode, status, width_cm, height_cm, depth_cm, weight_kg, seller_id, category_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT DO NOTHING RETURNING id
    `, ['Collier perles Mikimoto', 'Collier de perles de culture Mikimoto, or 18 carats, longueur 45cm, avec certificat', 3200.00, 2900.00, 'fixed', 'published', 45, 1, 1, 0.05, seller2.id, joaillerieCategory.id]);
    if (item15) console.log('✅ Created item: Collier perles Mikimoto');

    // Joaillerie items - Bagues
    const [item16] = await dataSource.query(`
      INSERT INTO items (name, description, price_desired, price_min, sale_mode, status, width_cm, height_cm, depth_cm, weight_kg, seller_id, category_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT DO NOTHING RETURNING id
    `, ['Bague diamant Art Déco', 'Bague en platine sertie d\'un diamant 1.5 carats, époque Art Déco, taille 54', 12500.00, 11000.00, 'auction', 'published', 2, 2, 2, 0.01, seller2.id, baguesCategory.id]);
    if (item16) console.log('✅ Created item: Bague diamant Art Déco');

    // Joaillerie items - General (bracelet)
    const [item17] = await dataSource.query(`
      INSERT INTO items (name, description, price_desired, price_min, sale_mode, status, width_cm, height_cm, depth_cm, weight_kg, seller_id, category_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT DO NOTHING RETURNING id
    `, ['Bracelet Cartier Love', 'Bracelet Cartier Love en or rose 18 carats, taille 17, avec tournevis et écrin d\'origine', 5800.00, 5400.00, 'fixed', 'published', 17, 1, 0.5, 0.03, seller1.id, joaillerieCategory.id]);
    if (item17) console.log('✅ Created item: Bracelet Cartier Love');

    // Add items to item_categories
    console.log('\n🔗 Linking items to categories...');
    const items = [item1, item2, item3, item4, item5, item6, item7, item8, item9, item10, item11, item12, item13, item14, item15, item16, item17];
    const categories = [
      modeCategory, modeCategory, modeCategory, modeCategory, // items 1-4 (Mode)
      artCategory, artCategory, artCategory, artCategory, // items 5-8 (Art)
      decorCategory, decorCategory, decorCategory, decorCategory, decorCategory, // items 9-13 (Décoration)
      montresCategory, joaillerieCategory, baguesCategory, joaillerieCategory // items 14-17 (Joaillerie: Montres, parent, Bagues, parent)
    ];
    
    for (let i = 0; i < items.length; i++) {
      if (items[i]) {
        await dataSource.query(`
          INSERT INTO item_categories (item_id, category_id) 
          VALUES ($1, $2) 
          ON CONFLICT DO NOTHING
        `, [items[i].id, categories[i].id]);
      }
    }
    console.log('✅ Items linked to categories');

    // 4. Create orders
    console.log('\n🛒 Creating orders...');

    const [order1] = await dataSource.query(`
      INSERT INTO orders (buyer_id, seller_id, total_amount, currency, status, billing_address_line, billing_city, billing_postal_code, billing_country, shipping_address_line, shipping_city, shipping_postal_code, shipping_country)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id
    `, [buyer1.id, seller1.id, 120.00, 'EUR', 'draft', '15 Rue de la Paix', 'Paris', '75002', 'France', '15 Rue de la Paix', 'Paris', '75002', 'France']);
    
    await dataSource.query(`
      INSERT INTO order_items (order_id, item_id, qty, unit_price)
      VALUES ($1, $2, $3, $4)
    `, [order1.id, item1.id, 1, 120.00]);
    console.log('✅ Created order #1: Veste en cuir');

    const [order2] = await dataSource.query(`
      INSERT INTO orders (buyer_id, seller_id, total_amount, currency, status, billing_address_line, billing_city, billing_postal_code, billing_country, shipping_address_line, shipping_city, shipping_postal_code, shipping_country)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id
    `, [buyer2.id, seller2.id, 1240.00, 'EUR', 'pending_payment', '42 Avenue des Champs-Élysées', 'Paris', '75008', 'France', '42 Avenue des Champs-Élysées', 'Paris', '75008', 'France']);
    
    await dataSource.query(`INSERT INTO order_items (order_id, item_id, qty, unit_price) VALUES ($1, $2, $3, $4)`, [order2.id, item2.id, 1, 350.00]);
    await dataSource.query(`INSERT INTO order_items (order_id, item_id, qty, unit_price) VALUES ($1, $2, $3, $4)`, [order2.id, item5.id, 1, 890.00]);
    console.log('✅ Created order #2: Tableau + Sculpture');

    const [order3] = await dataSource.query(`
      INSERT INTO orders (buyer_id, seller_id, total_amount, currency, status, billing_address_line, billing_city, billing_postal_code, billing_country, shipping_address_line, shipping_city, shipping_postal_code, shipping_country)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id
    `, [buyer1.id, seller1.id, 735.00, 'EUR', 'paid_escrow', '15 Rue de la Paix', 'Paris', '75002', 'France', '15 Rue de la Paix', 'Paris', '75002', 'France']);
    
    await dataSource.query(`INSERT INTO order_items (order_id, item_id, qty, unit_price) VALUES ($1, $2, $3, $4)`, [order3.id, item3.id, 1, 85.00]);
    await dataSource.query(`INSERT INTO order_items (order_id, item_id, qty, unit_price) VALUES ($1, $2, $3, $4)`, [order3.id, item6.id, 1, 650.00]);
    console.log('✅ Created order #3: Lampe + Miroir');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - 5 users created (2 buyers, 2 sellers, 1 admin)`);
    console.log(`   - 4 categories ensured`);
    console.log(`   - 17 items created (4 Mode, 4 Art, 5 Décoration, 4 Joaillerie)`);
    console.log(`   - 3 orders created`);
    console.log('\n🔑 Login credentials for all users:');
    console.log('   Email: marie.dupont@example.com or lucas.martin@example.com (buyers)');
    console.log('   Email: sophie.vintage@example.com or thomas.design@example.com (sellers)');
    console.log('   Email: admin@purpledog.com (admin)');
    console.log('   Password: password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    console.error(error.stack);
  } finally {
    await app.close();
  }
}

bootstrap();

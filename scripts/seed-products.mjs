/**
 * SkinVault Beauty — Product Seeder
 * Downloads images from teeka4.com → uploads to Cloudinary → inserts into Supabase
 */

import { createClient } from '@supabase/supabase-js';
import https from 'https';
import http from 'http';
import { createReadStream, createWriteStream, existsSync, mkdirSync } from 'fs';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import FormData from 'form-data';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMG_DIR = join(__dirname, '../tmp/product-images');
if (!existsSync(IMG_DIR)) mkdirSync(IMG_DIR, { recursive: true });

// ── Config ─────────────────────────────────────────────────────────────────
const SUPABASE_URL   = 'https://bhzwtjqkstakubcvtrht.supabase.co';
const SUPABASE_KEY   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoend0anFrc3Rha3ViY3Z0cmh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTk2MjU5OCwiZXhwIjoyMDk1NTM4NTk4fQ.5JByAYuvVKg2nP6_CSVtXbwpReHq5eHi0TCE5BG4X-c';
const CLOUD_NAME     = 'dbtfx54dh';
const CLOUD_API_KEY  = '243576748152134';
const CLOUD_SECRET   = '_cIkiG-owK9Emyat4zhEd5hiZ6g';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Raw product data from teeka4.com ───────────────────────────────────────
const RAW_PRODUCTS = [
  // ── TONERS & ESSENCES ──────────────────────────────────────────────────
  { name: 'Acwell Licorice pH Balancing Cleansing Toner 150ml', price: 12500, img: 'https://teeka4.com/wp-content/uploads/2025/10/WhatsApp-Image-at-cfcb-c-1-500x500.jpg', brand: 'Acwell', category: 'Toners & Essences', skin_types: ['all'], concerns: ['brightening','dark-spots','acne-scars'], tag: 'BESTSELLER', desc: 'Deep clean and brighten with this pH 5.5 balanced toner. High concentration licorice water and peony extract act as natural brighteners, while green tea extract calms and reduces pigmentation including acne scars and dark spots.', ingredients: 'Licorice Root Water, Glycerin, Niacinamide, Peony Extract, Green Tea Extract, Allantoin, Panthenol', how_to_use: 'After cleansing, apply to cotton pad and sweep across face morning and evening. Can also be used as a first step essence.', volume_ml: 150 },

  { name: 'Good Molecules Niacinamide Brightening Toner 120ml', price: 17999, img: 'https://teeka4.com/wp-content/uploads/2025/10/Good-Molecules-Niacinamide-Brightening-Toner-120ml.jpg', brand: 'Good Molecules', category: 'Toners & Essences', skin_types: ['oily','combination','acne-prone'], concerns: ['brightening','pores','oiliness'], tag: 'NEW', desc: 'A lightweight toner with 5% Niacinamide that visibly minimises pores, controls oil, and brightens dull skin tone. Formulated without alcohol for a gentle yet effective brightening experience.', ingredients: 'Water, Niacinamide (5%), Glycerin, Panthenol, Sodium PCA, Sodium Hyaluronate, Green Tea Extract', how_to_use: 'Apply to clean skin using hands or cotton pad. Follow with serum and moisturiser.', volume_ml: 120 },

  { name: 'Simple Kind To Skin Soothing Facial Toner 200ml', price: 4300, img: 'https://teeka4.com/wp-content/uploads/2025/10/1-7-1.jpg', brand: 'Simple', category: 'Toners & Essences', skin_types: ['sensitive','dry','all'], concerns: ['soothing','hydration'], tag: '', desc: 'Alcohol-free and fragrance-free toner packed with multi-vitamins and skin-loving ingredients. Removes last traces of makeup and impurities while calming and soothing sensitive skin.', ingredients: 'Water, Glycerin, Panthenol, Bisabolol, Allantoin, Pro-Vitamin B5, Vitamin E, Vitamin C', how_to_use: 'Apply to cotton wool and smooth over face after cleansing. Use morning and evening.', volume_ml: 200 },

  { name: "I'M From Rice Toner 150ml", price: 14500, img: 'https://teeka4.com/wp-content/uploads/2023/08/woo_product_image_ept-2987-image-500x500.jpg', brand: "I'M From", category: 'Toners & Essences', skin_types: ['dry','dull','all'], concerns: ['brightening','hydration','texture'], tag: '', desc: '77.78% rice extract toner that delivers intense brightening and hydration. Rich in amino acids and minerals to improve skin texture, restore elasticity, and leave skin visibly luminous.', ingredients: 'Rice Extract (77.78%), Water, Glycerin, Niacinamide, Sodium Hyaluronate, Panthenol, Ceramide NP', how_to_use: 'After cleansing, apply generous amount to palm and gently press into skin until absorbed.', volume_ml: 150 },

  { name: 'Hada Labo Gokujyun Premium Hydrating Lotion 170ml', price: 13200, img: 'https://teeka4.com/wp-content/uploads/2025/10/WhatsApp-Image-2023-10-19-at-14.22.55_f2553282.jpg', brand: 'Hada Labo', category: 'Toners & Essences', skin_types: ['dry','combination','all'], concerns: ['hydration','anti-aging'], tag: '', desc: 'Japan\'s #1 moisturising lotion featuring 5 types of Hyaluronic Acid. Creates a moisture-lock film on skin surface, delivers deep hydration into skin layers, and plumps skin from within.', ingredients: 'Water, Glycerin, BG, Sodium Hyaluronate, Hydrolyzed Hyaluronic Acid, Acetyl Hyaluronic Acid, Hydroxypropyltrimonium Hyaluronate', how_to_use: 'After cleansing, apply 2-3 pumps to palm and pat gently into face and neck.', volume_ml: 170 },

  { name: 'Anua Heartleaf 77+ Hyaluron Soothing Toner 250ml', price: 15800, img: 'https://teeka4.com/wp-content-uploads/2025/10/WhatsApp-Image-2025-08-21-at-15.13.49_7473f68a-500x500.jpg', brand: 'Anua', category: 'Toners & Essences', skin_types: ['sensitive','oily','combination'], concerns: ['soothing','hydration','redness'], tag: 'NEW', desc: '77% Heartleaf extract combined with Hyaluronic Acid to deeply soothe irritated skin and deliver lasting hydration. Ideal for reactive, redness-prone and post-acne skin.', ingredients: 'Heartleaf Extract (77%), Water, Glycerin, Sodium Hyaluronate, Centella Asiatica, Panthenol, Allantoin', how_to_use: 'After cleansing, apply with cotton pad or hands. Pat gently until absorbed.', volume_ml: 250 },

  { name: 'The Ordinary Glycolic Acid 7% Exfoliating Toner 240ml', price: 22500, img: 'https://teeka4.com/wp-content/uploads/2025/10/WhatsApp_Image_2025-02-07_at_13.28.25_f03f26c6-removebg-preview-e1739194178444.png', brand: 'The Ordinary', category: 'Toners & Essences', skin_types: ['oily','combination','normal'], concerns: ['exfoliation','texture','brightening'], tag: 'BESTSELLER', desc: 'A toning solution with 7% Glycolic Acid to exfoliate dead skin cells, improve skin tone and texture. Also contains Tasmanian pepperberry to reduce signs of irritation. Visibly improves skin clarity.', ingredients: 'Glycolic Acid (7%), Tasmanian Pepperberry Derivative, Water, Aloe Barbadensis Leaf Water, Glycerin, Sodium Hyaluronate Crosspolymer', how_to_use: 'Use once daily in the PM, apply to face and neck with cotton pad. Avoid eye area. Do not use on sensitive or peeling skin.', volume_ml: 240 },

  { name: 'The Ordinary Glycolic Acid 7% Exfoliating Toner 100ml', price: 17000, img: 'https://teeka4.com/wp-content/uploads/2025/10/WhatsApp_Image_2025-02-07_at_13.28.25_f03f26c6-removebg-preview.png', brand: 'The Ordinary', category: 'Toners & Essences', skin_types: ['oily','combination','normal'], concerns: ['exfoliation','texture','brightening'], tag: '', desc: '7% Glycolic Acid toning solution to exfoliate and visibly improve skin tone and texture. Same cult formula as the 240ml, in a travel-friendly size.', ingredients: 'Glycolic Acid (7%), Tasmanian Pepperberry Derivative, Water, Aloe Barbadensis Leaf Water, Glycerin', how_to_use: 'Use once daily in PM on cotton pad. Avoid eye area. Do not use on sensitive or peeling skin.', volume_ml: 100 },

  { name: 'Creightons Salicylic Acid Exfoliating Tonic 200ml', price: 7100, img: 'https://teeka4.com/wp-content/uploads/2025/10/creightons-salicylic-tonic-500x500.jpg', brand: 'Creightons', category: 'Toners & Essences', skin_types: ['oily','acne-prone','combination'], concerns: ['acne','pores','exfoliation'], tag: '', desc: 'Salicylic Acid 1% and Niacinamide 1% work together to unclog pores, reduce blemishes, and refine skin texture. Gentle enough for daily use and helps prevent future breakouts.', ingredients: 'Water, Glycerin, Salicylic Acid (1%), Niacinamide (1%), Witch Hazel, Aloe Vera, Tea Tree Oil', how_to_use: 'Apply to clean skin with cotton pad, avoid eye area. Use AM or PM.', volume_ml: 200 },

  { name: 'Tiam Snail & Azulene Water Essence 180ml', price: 9999, img: 'https://teeka4.com/wp-content/uploads/2025/10/image_a52fcd6a-b3ab-4fe9-8975-db0dbb358953_1024x1024@2x-500x500.webp', brand: 'TIAM', category: 'Toners & Essences', skin_types: ['dry','sensitive','all'], concerns: ['soothing','hydration','anti-aging'], tag: '', desc: 'Snail secretion filtrate and Azulene combine to repair the skin barrier, soothe irritation, and deliver intense moisture. Lightweight essence texture absorbs instantly without stickiness.', ingredients: 'Snail Secretion Filtrate, Azulene, Water, Glycerin, Sodium Hyaluronate, Panthenol, Centella Asiatica Extract', how_to_use: 'Apply after toner, press gently into skin. Can layer for extra hydration.', volume_ml: 180 },

  // ── SERUMS ───────────────────────────────────────────────────────────────
  { name: 'TIAM Vita B3 Source 40ml', price: 10999, img: 'https://teeka4.com/wp-content/uploads/2025/10/tiam-vita-b3-new-500x500.jpg', brand: 'TIAM', category: 'Serums', skin_types: ['all'], concerns: ['brightening','pores','oiliness','dark-spots'], tag: 'BESTSELLER', desc: 'A concentrated Niacinamide 5% serum enriched with Vitamin B3 complex to fade hyperpigmentation, minimise pores, control excess sebum, and deliver a radiant even-toned complexion.', ingredients: 'Water, Niacinamide (5%), Glycerin, Sodium Hyaluronate, Centella Asiatica, Panthenol, Adenosine', how_to_use: 'Apply 2-3 drops to face after toner, pat gently until absorbed. AM and PM.', volume_ml: 40 },

  { name: 'Good Molecules Discoloration Correcting Serum 30ml', price: 15800, img: 'https://teeka4.com/wp-content/uploads/2025/10/Good-Molecules-Discoloration-Correcting-Serum.jpg', brand: 'Good Molecules', category: 'Serums', skin_types: ['all'], concerns: ['dark-spots','brightening','hyperpigmentation'], tag: 'BESTSELLER', desc: 'A powerful brightening serum featuring Alpha Arbutin, Kojic Acid, and Tranexamic Acid to target stubborn dark spots, hyperpigmentation, and post-acne marks for visibly clearer skin.', ingredients: 'Water, Alpha Arbutin, Niacinamide, Kojic Acid, Tranexamic Acid, Glycerin, Sodium Hyaluronate, Panthenol', how_to_use: 'Apply 3-4 drops to cleansed face. Use AM and PM. Always wear SPF when using during the day.', volume_ml: 30 },

  { name: 'Good Molecules Discoloration Correcting Serum 75ml', price: 27500, img: 'https://teeka4.com/wp-content/uploads/2023/08/woo_product_image_ept-2939-image.png', brand: 'Good Molecules', category: 'Serums', skin_types: ['all'], concerns: ['dark-spots','brightening','hyperpigmentation'], tag: '', desc: 'The full-size version of the cult dark spot correcting serum. Alpha Arbutin, Kojic Acid, and Tranexamic Acid target all forms of hyperpigmentation for an even, radiant complexion.', ingredients: 'Water, Alpha Arbutin, Niacinamide, Kojic Acid, Tranexamic Acid, Glycerin, Sodium Hyaluronate, Panthenol', how_to_use: 'Apply 3-4 drops to cleansed face AM and PM. Always wear SPF during the day.', volume_ml: 75 },

  { name: 'Anua Niacinamide 10% + TXA 4% Serum 30ml', price: 18000, img: 'https://teeka4.com/wp-content/uploads/2025/10/WhatsApp-Image-2025-07-11-at-17.01.15_0748a558-500x500.jpg', brand: 'Anua', category: 'Serums', skin_types: ['all'], concerns: ['brightening','dark-spots','pores'], tag: 'NEW', desc: 'High-performance brightening serum with Niacinamide 10% and Tranexamic Acid 4%. Targets dark spots, minimises pores, controls oil and delivers a visibly brighter, more even skin tone.', ingredients: 'Water, Niacinamide (10%), Tranexamic Acid (4%), Glycerin, Heartleaf Extract, Panthenol, Sodium Hyaluronate', how_to_use: 'Apply 2-3 drops after toner, morning and evening. Follow with moisturiser. Use SPF in the morning.', volume_ml: 30 },

  { name: 'Good Molecules Niacinamide Serum 30ml', price: 9900, img: 'https://teeka4.com/wp-content/uploads/2025/10/Good-Molecules-Niacinamide-Serum.jpg', brand: 'Good Molecules', category: 'Serums', skin_types: ['all','oily','combination'], concerns: ['pores','brightening','oiliness'], tag: '', desc: 'A lightweight 5% Niacinamide serum that minimises the appearance of pores, controls excess oil production, and brightens skin tone. Non-comedogenic and suitable for daily use.', ingredients: 'Water, Niacinamide (5%), Glycerin, Panthenol, Sodium PCA, Sodium Hyaluronate, Green Tea Extract', how_to_use: 'Apply a few drops to clean skin before moisturiser. AM and PM use.', volume_ml: 30 },

  { name: 'Balance Active Formula 5% Vitamin C Brightening Serum 30ml', price: 9900, img: 'https://teeka4.com/wp-content/uploads/2023/08/OIP.webp', brand: 'Balance Active Formula', category: 'Serums', skin_types: ['dull','all'], concerns: ['brightening','anti-aging','dark-spots'], tag: '', desc: 'A concentrated vitamin C serum that brightens dull skin, reduces the appearance of dark spots, and protects against environmental damage. Lightweight formula suitable for all skin types.', ingredients: 'Water, Ascorbic Acid (5%), Glycerin, Niacinamide, Ferulic Acid, Vitamin E, Hyaluronic Acid, Aloe Vera', how_to_use: 'Apply to cleansed skin before moisturiser. Best used in AM with SPF. Start every other day if new to Vitamin C.', volume_ml: 30 },

  { name: 'Axis-Y Dark Spot Correcting Glow Serum 50ml', price: 12300, img: 'https://teeka4.com/wp-content/uploads/2023/08/woo_product_image_ept-1899-image-500x500.jpg', brand: 'Axis-Y', category: 'Serums', skin_types: ['all'], concerns: ['dark-spots','brightening','anti-aging'], tag: '', desc: 'A multi-correcting serum featuring Niacinamide, Tranexamic Acid, and plant-derived brighteners to fade dark spots and post-acne marks while delivering a glass-skin glow.', ingredients: 'Water, Niacinamide, Tranexamic Acid, Saccharomyces Ferment Filtrate, Centella Asiatica, Sodium Hyaluronate', how_to_use: 'Apply 3-4 drops on clean face, AM and PM before moisturiser.', volume_ml: 50 },

  { name: 'Beauty of Joseon Glow Deep Serum Rice + Alpha-Arbutin 30ml', price: 13200, img: 'https://teeka4.com/wp-content/uploads/2023/08/woo_product_image_ept-2519-image-500x500.png', brand: 'Beauty of Joseon', category: 'Serums', skin_types: ['all','dull'], concerns: ['brightening','dark-spots','hydration'], tag: 'BESTSELLER', desc: 'Inspired by traditional Korean beauty rituals, this serum combines fermented rice and 2% Alpha-Arbutin to fade dark spots and deliver deep brightening. Results visible in 2 weeks.', ingredients: 'Rice Bran Water (47.3%), Alpha-Arbutin (2%), Glycerin, Niacinamide, Sodium Hyaluronate, Xanthan Gum', how_to_use: 'Apply 2-3 drops to face and neck after toner. Pat until absorbed. Use AM and PM.', volume_ml: 30 },

  { name: 'Timeless Skin Care 20% Vitamin C + E Ferulic Acid Serum 30ml', price: 19500, img: 'https://teeka4.com/wp-content/uploads/2025/03/CEF-20_1oz-500x500.jpg', brand: 'Timeless', category: 'Serums', skin_types: ['normal','dry','combination'], concerns: ['anti-aging','brightening','dark-spots'], tag: 'CULT FAVE', desc: 'Clinical-strength 20% Vitamin C with Vitamin E and Ferulic Acid for maximum antioxidant protection and brightening. This potent combination neutralises free radicals, fades dark spots, and firms skin.', ingredients: 'Water, Ascorbic Acid (20%), Vitamin E, Ferulic Acid, Glycerin, Propylene Glycol, Sodium Hyaluronate', how_to_use: 'Apply 4-5 drops to clean face and neck in AM. Follow with SPF. Store in cool dark place.', volume_ml: 30 },

  { name: 'Timeless Skin Care 10% Vitamin C + E Ferulic Acid Serum 30ml', price: 19500, img: 'https://teeka4.com/wp-content/uploads/2023/08/CEF-10_1oz-500x500.jpg', brand: 'Timeless', category: 'Serums', skin_types: ['sensitive','normal','all'], concerns: ['brightening','anti-aging'], tag: '', desc: 'A gentler 10% Vitamin C serum ideal for those new to Vitamin C or with more sensitive skin. With Vitamin E and Ferulic Acid for enhanced stability and antioxidant efficacy.', ingredients: 'Water, Ascorbic Acid (10%), Vitamin E, Ferulic Acid, Glycerin, Sodium Hyaluronate', how_to_use: 'Apply 4-5 drops to clean face in AM before SPF. Great starter vitamin C serum.', volume_ml: 30 },

  { name: 'Good Molecules Gentle Retinol Cream 30g', price: 11450, img: 'https://teeka4.com/wp-content/uploads/2025/10/GOOD-MOLECULES-RETINOL.jpg', brand: 'Good Molecules', category: 'Serums', skin_types: ['all'], concerns: ['anti-aging','texture','dark-spots'], tag: 'NEW', desc: 'An encapsulated 0.1% Retinol cream that reduces fine lines, evens skin tone, and improves texture. Buffered with soothing Centella Asiatica to minimise irritation for retinol beginners.', ingredients: 'Water, Retinol (0.1% Encapsulated), Centella Asiatica, Ceramide NP, Niacinamide, Glycerin, Squalane', how_to_use: 'Use PM only, 2-3 nights per week to start. Apply a pea-sized amount after toner. Always use SPF next morning.', volume_ml: 30 },

  { name: 'Good Molecules Hyaluronic Acid Serum 30ml', price: 9900, img: 'https://teeka4.com/wp-content/uploads/2025/10/Good-Molecules-Hyaluronic-Acid-Serum-1fl-oz-500x500.jpg', brand: 'Good Molecules', category: 'Serums', skin_types: ['dry','all'], concerns: ['hydration','anti-aging'], tag: '', desc: 'A pure Hyaluronic Acid serum with 5 types of HA at different molecular weights to hydrate at multiple skin layers. Plumps, softens and smoothes skin for a dewy, moisturised finish.', ingredients: 'Water, Sodium Hyaluronate, Hydrolyzed Hyaluronic Acid, Acetyl Hyaluronic Acid, Glycerin, Panthenol', how_to_use: 'Apply to damp skin after toner. Pat in until absorbed, then seal with moisturiser.', volume_ml: 30 },

  { name: 'Good Molecules Daily Brightening Serum 30ml', price: 12000, img: 'https://teeka4.com/wp-content/uploads/2025/10/Good-Molecules-Daily-brightening-Serum-500x500.jpg', brand: 'Good Molecules', category: 'Serums', skin_types: ['all','dull'], concerns: ['brightening','dark-spots','radiance'], tag: '', desc: 'A daily brightening serum with Niacinamide, Alpha Arbutin and Vitamin C derivatives to gently fade dark spots and deliver an even, glowing complexion with consistent use.', ingredients: 'Water, Niacinamide, Alpha Arbutin, Ascorbyl Glucoside, Glycerin, Sodium Hyaluronate, Panthenol', how_to_use: 'Apply AM and PM after cleansing and toning. Follow with SPF in the morning.', volume_ml: 30 },

  { name: 'Good Molecules Overnight Exfoliating Treatment 30ml', price: 9900, img: 'https://teeka4.com/wp-content/uploads/2025/10/Goodmolecules-Overnight-Exfoliating-treatment-500x500.jpg', brand: 'Good Molecules', category: 'Serums', skin_types: ['all'], concerns: ['exfoliation','texture','brightening'], tag: '', desc: 'A leave-on overnight exfoliator with Glycolic Acid and Lactic Acid to resurface skin while you sleep. Wake up to visibly smoother, brighter, and more refined-looking skin.', ingredients: 'Water, Glycolic Acid, Lactic Acid, Glycerin, Sodium Hyaluronate, Niacinamide, Centella Asiatica', how_to_use: 'Apply a thin layer to face as the last step of PM routine. Rinse off in the morning. Wear SPF daily.', volume_ml: 30 },

  { name: 'Balance Active Formula 15% Niacinamide Serum 30ml', price: 8999, img: 'https://teeka4.com/wp-content/uploads/2025/10/BALANCE_NIACINAMIDE_SERUM_BOTTLE_FOP.webp', brand: 'Balance Active Formula', category: 'Serums', skin_types: ['oily','combination','acne-prone'], concerns: ['pores','oiliness','brightening'], tag: '', desc: 'High-strength 15% Niacinamide serum that dramatically minimises pores, controls shine, fades blemishes, and delivers a visibly brighter complexion. Results visible in 4 weeks.', ingredients: 'Water, Niacinamide (15%), Glycerin, Zinc PCA, Panthenol, Sodium Hyaluronate, Green Tea Extract', how_to_use: 'Apply 3-5 drops on clean skin before moisturiser. Start every other day if new to Niacinamide at this strength.', volume_ml: 30 },

  // ── CLEANSERS ────────────────────────────────────────────────────────────
  { name: 'FaceFacts Ceramide Hydrating Gentle Cleanser 400ml', price: 7200, img: 'https://teeka4.com/wp-content/uploads/2024/03/WhatsApp-Image-2026-03-31-at-09.06.06-500x500.jpeg', brand: 'FaceFacts', category: 'Cleansers', skin_types: ['dry','sensitive','all'], concerns: ['hydration','soothing'], tag: '', desc: 'A gentle, hydrating gel cleanser enriched with Ceramide and Hyaluronic Acid. Effectively removes makeup and impurities without stripping the skin barrier. Leaves skin clean, soft, and comfortable.', ingredients: 'Water, Glycerin, Ceramide NP, Sodium Hyaluronate, Panthenol, Aloe Vera, Chamomile Extract, Allantoin', how_to_use: 'Apply to wet skin, massage gently, rinse thoroughly. AM and PM.', volume_ml: 400 },

  { name: 'FaceFacts Ceramide Foaming Cleanser 400ml', price: 6500, img: 'https://teeka4.com/wp-content/uploads/2025/10/36636-150FaceFactsCeramideFoamingCleanser400ml_689e6f1d-1c5f-48e4-a055-cefa5ca3d6f8_1800x1800-500x500.webp', brand: 'FaceFacts', category: 'Cleansers', skin_types: ['normal','combination','oily'], concerns: ['cleansing','pores'], tag: '', desc: 'A creamy foaming cleanser with Ceramide that deeply cleanses pores while maintaining the skin\'s natural moisture barrier. Leaves skin refreshed without the tight, stripped feeling.', ingredients: 'Water, Glycerin, Ceramide NP, Niacinamide, Cocamidopropyl Betaine, Sodium Lauroyl Glutamate, Panthenol', how_to_use: 'Dampen skin, lather a small amount and massage in circular motions. Rinse and pat dry.', volume_ml: 400 },

  { name: 'FaceFacts Ceramide Hydrating Gentle Cleanser 200ml', price: 5700, img: 'https://teeka4.com/wp-content/uploads/2025/10/facefacts-hydrating-cleanser-ml-500x500.jpg', brand: 'FaceFacts', category: 'Cleansers', skin_types: ['dry','sensitive'], concerns: ['hydration','gentle-cleansing'], tag: '', desc: 'Same beloved ceramide-rich gentle cleanser in a convenient travel size. Hydrates as it cleanses without stripping the skin barrier. Perfect for dry and sensitive skin types.', ingredients: 'Water, Glycerin, Ceramide NP, Sodium Hyaluronate, Panthenol, Aloe Vera, Chamomile Extract', how_to_use: 'Apply to damp skin, massage gently, rinse. AM and PM use.', volume_ml: 200 },

  { name: 'Simple Kind To Skin Moisturizing Facial Wash 150ml', price: 4999, img: 'https://teeka4.com/wp-content/uploads/2023/08/b38e2a5b-5994-410b-998d-46dd8436d6c1-500x500.png', brand: 'Simple', category: 'Cleansers', skin_types: ['sensitive','dry','all'], concerns: ['gentle-cleansing','soothing'], tag: '', desc: 'A kind, gentle face wash free from artificial perfume, colour and harsh chemicals. Contains Pro-Vitamin B5, Vitamin E, and skin-loving Bisabolol. Leaves skin clean, healthy-feeling and glowing.', ingredients: 'Water, Glycerin, Cocamidopropyl Betaine, Panthenol (Pro-Vitamin B5), Tocopheryl Acetate (Vitamin E), Bisabolol', how_to_use: 'Wet face and hands, apply, work into a lather, rinse well. AM and PM.', volume_ml: 150 },

  { name: 'Tiam Snail & Azulene Low pH Cleanser 200ml', price: 8800, img: 'https://teeka4.com/wp-content/uploads/2025/10/8-500x500.webp', brand: 'TIAM', category: 'Cleansers', skin_types: ['sensitive','acne-prone','all'], concerns: ['gentle-cleansing','soothing','barrier-repair'], tag: '', desc: 'A low pH (5.5) foaming cleanser with Snail Secretion Filtrate and Azulene to cleanse thoroughly while calming and repairing the skin barrier. Great for acne-prone or reactive skin.', ingredients: 'Water, Snail Secretion Filtrate, Azulene, Glycerin, Sodium Cocoamphoacetate, Panthenol, Allantoin', how_to_use: 'Wet face, massage a small amount to lather, rinse off. Use morning and evening.', volume_ml: 200 },

  { name: 'Panoxyl Acne Foaming Wash Benzoyl Peroxide 10% 156g', price: 14500, img: 'https://teeka4.com/wp-content/uploads/2025/10/WhatsApp-Image-at-aa-eae-removebg-preview-e1736412638399.png', brand: 'PanOxyl', category: 'Cleansers', skin_types: ['acne-prone','oily'], concerns: ['acne','blemishes'], tag: 'BESTSELLER', desc: 'Maximum strength 10% Benzoyl Peroxide foaming acne wash that kills acne-causing bacteria and prevents new breakouts. Clinically proven to clear and prevent acne on face, chest, and back.', ingredients: 'Benzoyl Peroxide (10%), Water, Disodium Laureth Sulfosuccinate, Glycerin, Carbomer, Sodium Hydroxide', how_to_use: 'Wet skin, apply and work to a lather. Leave on 1-2 minutes then rinse. Use once daily, increase gradually. Use SPF.', volume_ml: 156 },

  { name: 'Panoxyl Acne Creamy Wash Benzoyl Peroxide 4% 6oz', price: 14500, img: 'https://teeka4.com/wp-content/uploads/2025/10/Artboard-1-500x500.jpg', brand: 'PanOxyl', category: 'Cleansers', skin_types: ['acne-prone','sensitive'], concerns: ['acne','blemishes'], tag: '', desc: 'A milder 4% Benzoyl Peroxide creamy wash for daily acne control. Gentle enough for sensitive acne-prone skin while effectively killing acne bacteria and preventing new breakouts.', ingredients: 'Benzoyl Peroxide (4%), Water, Glycerin, Cetyl Alcohol, Disodium Laureth Sulfosuccinate, Sodium PCA', how_to_use: 'Wet skin, massage onto face and body. Leave on briefly then rinse. Start every other day.', volume_ml: 170 },

  { name: 'Cerave Foaming Cleanser Normal to Oily Skin 473ml', price: 18000, img: 'https://teeka4.com/wp-content/uploads/2025/10/WhatsApp-Image-2024-03-12-at-11.34.05_db7c43c7-500x500.jpg', brand: 'CeraVe', category: 'Cleansers', skin_types: ['normal','oily','combination'], concerns: ['cleansing','pores','barrier-repair'], tag: 'BESTSELLER', desc: 'Developed with dermatologists, this foaming cleanser contains 3 essential Ceramides and Hyaluronic Acid to cleanse, remove excess oil, and maintain the skin\'s natural protective barrier.', ingredients: 'Water, Glycerin, Niacinamide, Ceramide NP, Ceramide AP, Ceramide EOP, Sodium Hyaluronate, Hyaluronic Acid', how_to_use: 'Wet face, massage a generous amount, rinse thoroughly. AM and PM use.', volume_ml: 473 },

  { name: 'CeraVe SA Smoothing Cleanser 236ml', price: 14222, img: 'https://teeka4.com/wp-content/uploads/2025/10/CERAVE-SA-CLEANSER.jpg', brand: 'CeraVe', category: 'Cleansers', skin_types: ['rough','bumpy','dry'], concerns: ['exfoliation','texture','keratosis'], tag: '', desc: 'Developed with dermatologists, this Salicylic Acid cleanser gently exfoliates rough, bumpy, and dry skin. Contains 3 Ceramides and Hyaluronic Acid to maintain the skin\'s moisture barrier while smoothing texture.', ingredients: 'Salicylic Acid, Glycerin, Ceramide NP, Ceramide AP, Ceramide EOP, Hyaluronic Acid, Niacinamide', how_to_use: 'Apply to wet skin, massage in circular motions, rinse. Best used PM. Avoid eye area.', volume_ml: 236 },

  { name: 'Skeenlogic Acne Creamy Foaming Wash 200ml', price: 12500, img: 'https://teeka4.com/wp-content/uploads/2025/10/WhatsApp-Image-2024-01-25-at-13.09.18_9ea0a225-500x500.jpg', brand: 'Skeenlogic', category: 'Cleansers', skin_types: ['acne-prone','oily'], concerns: ['acne','blemishes','cleansing'], tag: '', desc: 'A creamy acne-targeting foaming wash formulated specifically for acne-prone skin. Controls excess sebum, deeply cleanses clogged pores, and reduces the frequency of breakouts without over-drying.', ingredients: 'Water, Glycerin, Benzoyl Peroxide, Ceramide, Panthenol, Allantoin, Tea Tree Oil', how_to_use: 'Wet face, apply and lather, leave on 30 seconds then rinse. Use daily.', volume_ml: 200 },

  { name: 'Skeenlogic AHA/BHA Gentle Deep Pore Cleanser 200ml', price: 11500, img: 'https://teeka4.com/wp-content/uploads/2025/10/WhatsApp-Image-2024-01-25-at-13.09.19_ab481198-500x500.jpg', brand: 'Skeenlogic', category: 'Cleansers', skin_types: ['oily','combination','acne-prone'], concerns: ['pores','exfoliation','acne'], tag: '', desc: 'An advanced dual-acid cleanser combining AHA and BHA to deeply exfoliate, unclog pores, and refine skin texture. Leaves skin smooth, clear, and visibly less congested after every wash.', ingredients: 'Water, Glycolic Acid (AHA), Salicylic Acid (BHA), Glycerin, Ceramide, Tea Tree Extract, Allantoin', how_to_use: 'Wet face, massage onto skin, leave on 1 minute, rinse. Use PM only. Wear SPF in AM.', volume_ml: 200 },

  // ── MOISTURIZERS ─────────────────────────────────────────────────────────
  { name: 'FaceFacts Ceramide Moisturising Gel Cream 50ml', price: 3800, img: 'https://teeka4.com/wp-content/uploads/2025/10/28570-150FaceFactsCeramideMoisturisingGelCream2kx2k_1800x1800-500x500.webp', brand: 'FaceFacts', category: 'Moisturizers', skin_types: ['oily','combination','normal'], concerns: ['hydration','barrier-repair'], tag: '', desc: 'A lightweight gel cream moisturiser rich in Ceramides that strengthens the skin barrier and delivers all-day hydration without heaviness or greasiness. Great for humid climates.', ingredients: 'Water, Glycerin, Ceramide NP, Ceramide AP, Niacinamide, Sodium Hyaluronate, Panthenol', how_to_use: 'Apply morning and evening after serum on cleansed face and neck.', volume_ml: 50 },

  { name: 'Simple Kind To Skin Hydrating Light Moisturizer 125ml', price: 4999, img: 'https://teeka4.com/wp-content/uploads/2025/10/simple-e1706616966340.jpg', brand: 'Simple', category: 'Moisturizers', skin_types: ['sensitive','normal','dry'], concerns: ['hydration','soothing'], tag: '', desc: 'A light, non-greasy moisturiser packed with multi-vitamins and skin-loving botanicals. Free from artificial perfume, colour, and harsh chemicals. Absorbs quickly for soft, hydrated skin all day.', ingredients: 'Water, Glycerin, Pro-Vitamin B5, Vitamin E, Bisabolol, Allantoin, Chamomile Extract', how_to_use: 'Apply to face and neck after cleansing. Use AM and PM.', volume_ml: 125 },

  { name: 'Advanced Clinicals Vitamin C Cream 454g', price: 16500, img: 'https://teeka4.com/wp-content/uploads/2025/10/CL10141-R4_-_Vitamin_C_Cream_-_Main_2048x-500x500.webp', brand: 'Advanced Clinicals', category: 'Moisturizers', skin_types: ['all','dull'], concerns: ['brightening','anti-aging','dark-spots'], tag: '', desc: 'A rich Vitamin C brightening cream for face and body that fades dark spots, evens skin tone, and deeply moisturises. Formulated with Vitamin C, E, and Green Tea for comprehensive antioxidant protection.', ingredients: 'Water, Vitamin C (Ascorbic Acid), Vitamin E, Green Tea Extract, Glycerin, Shea Butter, Aloe Vera', how_to_use: 'Apply generously to face and body daily. Massage until fully absorbed. Use SPF during daytime.', volume_ml: 454 },

  { name: 'Touch Bright and Clear Cream 2oz', price: 23000, img: 'https://teeka4.com/wp-content/uploads/2025/10/Touch-Bright-Clear-Cream-2oz-500x500.jpg', brand: 'Touch', category: 'Moisturizers', skin_types: ['all'], concerns: ['brightening','dark-spots','hyperpigmentation'], tag: 'LIMITED', desc: 'A premium brightening face cream with a potent blend of brightening actives to visibly reduce dark spots, hyperpigmentation, and uneven skin tone. Leaves skin luminous and radiant.', ingredients: 'Water, Kojic Acid, Niacinamide, Alpha Arbutin, Glycerin, Shea Butter, Hyaluronic Acid, Vitamin C', how_to_use: 'Apply to clean face morning and evening. Use SPF during the day.', volume_ml: 56 },

  { name: 'Kojivit Ultra Gel 30g', price: 10500, img: 'https://teeka4.com/wp-content/uploads/2023/08/woo_product_image_ept-1871-image.jpg', brand: 'Kojivit', category: 'Moisturizers', skin_types: ['all'], concerns: ['dark-spots','brightening','hyperpigmentation'], tag: '', desc: 'A dermatologist-recommended gel for hyperpigmentation containing Kojic Acid and Vitamin E. Effectively lightens dark spots, melasma, and uneven skin tone while moisturising and protecting the skin.', ingredients: 'Kojic Acid (2%), Vitamin E, Glycerin, Water, Carbomer, Sodium Hyaluronate, Allantoin', how_to_use: 'Apply a small amount to affected areas twice daily. Use SPF during daytime.', volume_ml: 30 },

  { name: 'Isntree Green Tea Fresh Emulsion 120ml', price: 11800, img: 'https://teeka4.com/wp-content/uploads/2023/08/woo_product_image_ept-2994-image-500x500.jpg', brand: 'Isntree', category: 'Moisturizers', skin_types: ['oily','combination','sensitive'], concerns: ['hydration','soothing','anti-aging'], tag: '', desc: 'A lightweight emulsion with 75% Green Tea Water that controls sebum, soothes irritated skin, and provides lasting hydration without any heaviness. Ideal for warm, humid climates.', ingredients: 'Green Tea Water (75%), Glycerin, Niacinamide, Centella Asiatica, Sodium Hyaluronate, Panthenol', how_to_use: 'Apply as the final moisturising step after serum. AM and PM. Can be layered for extra hydration.', volume_ml: 120 },

  // ── SUNSCREEN ────────────────────────────────────────────────────────────
  { name: 'Nivea UV Super Water Gel SPF 50 PA+++ 140g', price: 13999, img: 'https://teeka4.com/wp-content/uploads/2025/10/niveasupergel2-500x500.jpg', brand: 'Nivea', category: 'Sunscreen', skin_types: ['normal','oily','combination'], concerns: ['sun-protection'], tag: 'BESTSELLER', desc: 'A refreshing water-based sunscreen gel that feels weightless and moisturising. SPF 50 and PA+++ provides broad-spectrum UV protection. Non-greasy, absorbs instantly and leaves no white cast.', ingredients: 'Water, Glycerin, Niacinamide, Homosalate, Octinoxate, Octocrylene, Hyaluronic Acid', how_to_use: 'Apply generously as the final AM step. Reapply every 2 hours in direct sunlight.', volume_ml: 140 },

  { name: 'Skin Aqua UV Super Moisture Gel Pump SPF 50+ PA++++ 140g', price: 12200, img: 'https://teeka4.com/wp-content/uploads/2025/10/WhatsApp-Image-2024-03-29-at-13.14.25_239cbd14-500x500.jpg', brand: 'Skin Aqua', category: 'Sunscreen', skin_types: ['all','dry'], concerns: ['sun-protection','hydration'], tag: 'BESTSELLER', desc: 'Japan\'s cult favourite sunscreen with SPF 50+ PA++++ and deep moisturising formula. Ultra-lightweight, non-greasy, no white cast. Contains Hyaluronic Acid and Collagen for extra skin benefits.', ingredients: 'Water, Glycerin, Hyaluronic Acid, Collagen, Alcohol, Homosalate, Ethylhexyl Triazone, Uvinul A Plus', how_to_use: 'Apply generously 15 mins before sun exposure as last step of AM routine. Reapply every 2 hours.', volume_ml: 140 },

  { name: 'Missha All-Around Safe Block Aqua Sun Gel SPF50+/PA+++ 50ml', price: 9999, img: 'https://teeka4.com/wp-content/uploads/2023/08/woo_product_image_ept-785-image.jpg', brand: 'Missha', category: 'Sunscreen', skin_types: ['oily','combination'], concerns: ['sun-protection'], tag: '', desc: 'A lightweight aqua-gel sunscreen that applies clear with no white cast. SPF 50+/PA+++ provides maximum UV protection while the gel texture cools and refreshes skin on contact.', ingredients: 'Water, Glycerin, Ethylhexyl Methoxycinnamate, Diethylaminohydroxybenzoyl Hexyl Benzoate, Panthenol', how_to_use: 'Apply to face and exposed areas 15 minutes before sun exposure. Reapply every 2 hours outdoors.', volume_ml: 50 },

  { name: 'Beauty of Joseon Relief Sun Rice + Probiotics SPF50+ PA++++', price: 13500, img: 'https://teeka4.com/wp-content/uploads/2023/08/woo_product_image_ept-5118-image-500x500.jpg', brand: 'Beauty of Joseon', category: 'Sunscreen', skin_types: ['sensitive','dry','all'], concerns: ['sun-protection','brightening','soothing'], tag: 'CULT FAVE', desc: 'A luxurious Korean sunscreen blending SPF50+ PA++++ protection with the brightening power of Rice and the balancing benefits of Probiotics. Gentle enough for sensitive skin with a beautiful satin finish.', ingredients: 'Niacinamide, Rice Extract, Probiotics (Lactobacillus), Glycerin, Sodium Hyaluronate, Zinc Oxide', how_to_use: 'Apply generously to face and neck as final AM step. Reapply every 2 hours outdoors.', volume_ml: 50 },

  { name: 'Hatomugi UV and Moisturizing Milky Gel SPF50+ PA++++ 250ml', price: 12000, img: 'https://teeka4.com/wp-content/uploads/2025/10/hamotugi.jpg', brand: 'Hatomugi', category: 'Sunscreen', skin_types: ['all'], concerns: ['sun-protection','hydration'], tag: '', desc: 'A 2-in-1 UV protection and moisturising gel from Japan. SPF50+ PA++++ shields against UV rays while the milky gel formula deeply hydrates. Leaves skin smooth, moisturised, and protected all day.', ingredients: 'Water, Glycerin, Coix Lacryma-Jobi (Job\'s Tears) Extract, Niacinamide, Sodium Hyaluronate, UV Filters', how_to_use: 'Apply before going out, suitable for face and body. Reapply as needed.', volume_ml: 250 },

  // ── BODY CARE ────────────────────────────────────────────────────────────
  { name: "Dr Teal's Glow & Radiance Body Wash Vitamin C 710ml", price: 7500, img: 'https://teeka4.com/wp-content/uploads/2025/10/cGF0aD0lMkZtZWRpYSUyRmNhdGFsb2clMkZwcm9kdWN0JTJGcCUyRmwlMkZwbGV4LWRydDAwMTk2NzEtMS5qcGcmZml0PWNvdmVyJndpZHRoPTY0MA-500x500.webp', brand: "Dr Teal's", category: 'Body Care', skin_types: ['all'], concerns: ['brightening','hydration'], tag: '', desc: 'An invigorating body wash infused with Vitamin C and Citrus Essential Oils to cleanse, brighten, and revitalise dull skin. Leaves skin feeling fresh, glowing, and subtly scented.', ingredients: 'Water, Sodium Laureth Sulfate, Glycerin, Vitamin C, Citrus Essential Oil, Cocamidopropyl Betaine', how_to_use: 'Apply to wet skin with a loofah or hands, lather and rinse. Use daily.', volume_ml: 710 },

  { name: "Dr Teal's Vitamin C Body Lotion 18oz", price: 7500, img: 'https://teeka4.com/wp-content/uploads/2025/10/WhatsApp-Image-2024-03-07-at-15.20.48_0464ded5-500x500.jpg', brand: "Dr Teal's", category: 'Body Care', skin_types: ['all','dull'], concerns: ['brightening','hydration'], tag: '', desc: 'A rich body lotion with Vitamin C and moisturising skin conditioners that brightens, hydrates, and leaves skin feeling silky smooth. Helps fade dark spots and even body skin tone.', ingredients: 'Water, Glycerin, Vitamin C, Shea Butter, Aloe Vera, Vitamin E, Dimethicone', how_to_use: 'Apply generously to clean skin daily. Best after showering while skin is slightly damp.', volume_ml: 532 },

  { name: "Dr Teal's Shea Sugar Scrub Vitamin C 538g", price: 11300, img: 'https://teeka4.com/wp-content/uploads/2025/10/WhatsApp-Image-2025-04-02-at-15.05.23_122dc75f-500x500.jpg', brand: "Dr Teal's", category: 'Body Care', skin_types: ['all'], concerns: ['exfoliation','brightening'], tag: '', desc: 'A luxurious sugar body scrub with Shea Butter, Orange Oil, and Avocado Oil. Gently exfoliates dead skin cells while Vitamin C brightens. Leaves skin silky smooth, hydrated, and glowing.', ingredients: 'Sugar, Shea Butter, Avocado Oil, Orange Essential Oil, Vitamin C, Glycerin, Sunflower Oil', how_to_use: 'Wet skin, massage scrub in circular motions, rinse thoroughly. Use 2-3 times weekly in shower.', weight_g: 538 },

  { name: 'Kojie San Skin Lightening Soap Kojic Acid 100g Pack of 3', price: 6500, img: 'https://teeka4.com/wp-content/uploads/2023/08/WhatsApp-Image-2025-12-03-at-15.01.20_fedf8fc0.jpg', brand: 'Kojie San', category: 'Body Care', skin_types: ['all'], concerns: ['brightening','dark-spots','hyperpigmentation'], tag: 'BESTSELLER', desc: 'Original Kojic Acid brightening soap trusted for decades. Fades dark spots, hyperpigmentation, and uneven skin tone on face and body. The Kojic Acid works to reduce melanin production for brighter skin.', ingredients: 'Kojic Acid (2%), Glycerin, Coconut Oil, Sodium Hydroxide, Castor Oil, Vitamin C', how_to_use: 'Lather on wet skin, leave on for 1-2 minutes, rinse. Follow with moisturiser and SPF. Pack of 3 bars x 100g.', weight_g: 300 },

  { name: 'Palmer\'s Skin Success Anti-Dark Spot Fade Milk 250ml', price: 14500, img: 'https://teeka4.com/wp-content/uploads/2025/10/WhatsApp-Image-at-e-b-b-500x500.jpg', brand: "Palmer's", category: 'Body Care', skin_types: ['all'], concerns: ['dark-spots','brightening','hyperpigmentation'], tag: '', desc: 'A tone-correcting body lotion with Vitamin C, Niacinamide, and Alpha Hydroxy Acids that target dark spots and uneven body skin tone. Clinically proven to visibly reduce dark spots in 2 weeks.', ingredients: 'Water, Vitamin C, Niacinamide, AHA, Glycerin, Shea Butter, Cocoa Butter, Vitamin E', how_to_use: 'Apply daily to affected areas. Best after showering on slightly damp skin. Use SPF during daytime.', volume_ml: 250 },

  { name: "Palmer's Cocoa Butter Formula Skin Therapy Oil 150ml", price: 16500, img: 'https://teeka4.com/wp-content/uploads/2025/10/WhatsApp-Image-2023-10-20-at-14.49.17_4b5156db-433x500.jpg', brand: "Palmer's", category: 'Body Care', skin_types: ['dry','all'], concerns: ['hydration','anti-aging','stretch-marks'], tag: '', desc: 'A rich multipurpose body oil with pure Cocoa Butter, Vitamin E, and powerful antioxidants. Helps reduce the appearance of scars, stretch marks, and dark spots while deeply moisturising dry skin.', ingredients: 'Theobroma Cacao (Cocoa) Seed Butter, Dimethicone, Prunus Amygdalus Dulcis Oil, Tocopheryl Acetate (Vitamin E), Rosehip Oil', how_to_use: 'Apply to dry skin or after showering. Massage gently into targeted areas.', volume_ml: 150 },

  { name: "Palmer's Cocoa Butter Body Oil with Vitamin E 8.5oz", price: 9750, img: 'https://teeka4.com/wp-content/uploads/2023/08/woo_product_image_ept-5148-image.png', brand: "Palmer's", category: 'Body Care', skin_types: ['dry','all'], concerns: ['hydration','anti-aging'], tag: '', desc: 'Classic Palmer\'s Cocoa Butter oil enriched with Vitamin E to deeply moisturise, soften, and improve skin elasticity. Absorbs quickly leaving skin smooth, supple, and beautifully scented.', ingredients: 'Theobroma Cacao Seed Butter, Mineral Oil, Tocopheryl Acetate (Vitamin E), Prunus Amygdalus Dulcis Oil', how_to_use: 'Apply to body after bathing. Can be used on face, body, and hair.', volume_ml: 250 },

  { name: 'Vaseline Intensive Care Cocoa Radiant Body Oil 200ml', price: 9999, img: 'https://teeka4.com/wp-content/uploads/2023/08/woo_product_image_ept-3709-image-500x500.jpg', brand: 'Vaseline', category: 'Body Care', skin_types: ['dry','all'], concerns: ['hydration','brightening'], tag: '', desc: 'A luxurious body oil with Cocoa Butter and Vaseline healing jelly that provides instant radiance and long-lasting moisture. Non-greasy formula absorbs fast and leaves skin glowing.', ingredients: 'Mineral Oil, Glycerin, Cocoa Butter, Petrolatum, Vitamin B3, Fragrance', how_to_use: 'Apply to dry or wet skin after showering. Massage in and allow to absorb.', volume_ml: 200 },

  { name: 'Olay Renewing Retinol Serum Body Wash 591ml', price: 15500, img: 'https://teeka4.com/wp-content/uploads/2025/10/img_8652-500x500.webp', brand: 'Olay', category: 'Body Care', skin_types: ['mature','dry','all'], concerns: ['anti-aging','texture','hydration'], tag: '', desc: 'An advanced body wash with Retinol and Vitamin B3 Complex that cleanses while exfoliating and renewing skin. Improves skin texture, reduces the look of dryness and dullness with every shower.', ingredients: 'Water, Sodium Laureth Sulfate, Glycerin, Retinol, Niacinamide (B3), Cocamidopropyl Betaine', how_to_use: 'Lather on wet skin, massage gently, rinse. Use daily. Follow with moisturiser.', volume_ml: 591 },

  { name: 'Olay Vitamin C Brightening Body Wash 591ml', price: 15200, img: 'https://teeka4.com/wp-content/uploads/2025/10/6_450.webp', brand: 'Olay', category: 'Body Care', skin_types: ['dull','all'], concerns: ['brightening','hydration'], tag: '', desc: 'A brightening body wash serum with Vitamin C that leaves skin visibly brighter and more radiant in just one wash. Formulated with skin-conditioning actives to cleanse and moisturise simultaneously.', ingredients: 'Water, Sodium Laureth Sulfate, Vitamin C, Glycerin, Niacinamide, Cocamidopropyl Betaine', how_to_use: 'Apply to wet skin, lather, rinse. Use daily for brightest results.', volume_ml: 591 },

  { name: 'Garnier Bright Complete Vitamin C Body Serum Lotion 400ml', price: 8500, img: 'https://teeka4.com/wp-content/uploads/2025/10/8992304012549_T2-500x500.png', brand: 'Garnier', category: 'Body Care', skin_types: ['all','dull'], concerns: ['brightening','hydration'], tag: '', desc: 'A serum-infused body lotion with Vitamin C and Lemon extract that brightens, evens skin tone, and provides lasting moisture. Results in visibly brighter skin from the first application.', ingredients: 'Water, Glycerin, Vitamin C (Ascorbyl Glucoside), Lemon Extract, Niacinamide, Shea Butter', how_to_use: 'Apply to clean body skin daily. Best after showering while skin is still slightly damp.', volume_ml: 400 },

  { name: 'Nivea Radiant & Beauty Even Glow Body Lotion 400ml', price: 6300, img: 'https://teeka4.com/wp-content/uploads/2025/10/IMG_6375-433x500.png', brand: 'Nivea', category: 'Body Care', skin_types: ['all'], concerns: ['brightening','hydration'], tag: '', desc: 'A daily moisturising lotion with Vitamin C and skin-brightening technology that helps achieve an even, radiant body skin tone. Absorbs quickly and provides all-day moisture.', ingredients: 'Water, Glycerin, Vitamin C, Niacinamide, Shea Butter, Dimethicone, Allantoin', how_to_use: 'Apply daily to body skin after bathing. Massage in circular motions until absorbed.', volume_ml: 400 },

  // ── TREATMENTS ───────────────────────────────────────────────────────────
  { name: 'Kabazel Azelaic Acid Gel 20%', price: 5600, img: 'https://teeka4.com/wp-content/uploads/2025/10/kabazel-500x500.png', brand: 'Kabazel', category: 'Masks & Treatments', skin_types: ['acne-prone','sensitive','rosacea'], concerns: ['acne','redness','brightening'], tag: '', desc: 'A pharmaceutical-grade 20% Azelaic Acid gel for treating acne, rosacea, and hyperpigmentation. Reduces inflammation, kills acne bacteria, fades post-acne marks, and brightens skin tone.', ingredients: 'Azelaic Acid (20%), Water, Glycerin, Cetearyl Alcohol, Benzyl Alcohol, Propylene Glycol', how_to_use: 'Apply a thin layer to affected areas once or twice daily. Can be used as a spot treatment. Use SPF.', volume_ml: 30 },

  { name: 'Tretikab Tretinoin Gel USP 0.05% 20g', price: 4500, img: 'https://teeka4.com/wp-content/uploads/2025/10/tertikab-500x500.png', brand: 'Tretikab', category: 'Masks & Treatments', skin_types: ['acne-prone','mature','oily'], concerns: ['acne','anti-aging','texture'], tag: '', desc: 'Prescription-strength Tretinoin 0.05% gel for treating acne, reducing fine lines, and improving skin texture. The gold standard in dermatology for cellular renewal and anti-aging.', ingredients: 'Tretinoin (0.05%), Water, Glycerin, Hydroxypropyl Cellulose, BHA, Propylene Glycol', how_to_use: 'Use PM only. Start 2 nights/week. Apply pea-sized amount to entire face. Always use SPF the next morning.', volume_ml: 20 },

  { name: 'KAbolene Adapalene Gel Microspheres 0.1% 15g', price: 5700, img: 'https://teeka4.com/wp-content/uploads/2025/10/7-500x500.png', brand: 'KAbolene', category: 'Masks & Treatments', skin_types: ['acne-prone','oily'], concerns: ['acne','anti-aging','texture'], tag: '', desc: 'Adapalene 0.1% microsphere gel — a next-generation retinoid for treating acne and reducing blackheads. Gentler than Tretinoin with comparable efficacy. Reduces inflammation and prevents new breakouts.', ingredients: 'Adapalene (0.1%), Microspheres, Carbomer, Poloxamer 407, Water, Sodium Hydroxide', how_to_use: 'Apply a pea-sized amount PM to entire face after cleansing. Introduce slowly (every 3rd night) to build tolerance.', volume_ml: 15 },

  { name: 'FaceFacts Salicylic Acid Facial Serum 30ml', price: 3700, img: 'https://teeka4.com/wp-content/uploads/2025/10/30276-150FaceFactsSalicylicAcidSerum_1800x1800-500x500.webp', brand: 'FaceFacts', category: 'Masks & Treatments', skin_types: ['oily','acne-prone'], concerns: ['acne','pores','exfoliation'], tag: '', desc: 'A targeted Salicylic Acid serum that penetrates deep into pores to dissolve blockages, reduce blemishes, and refine skin texture. Helps prevent future breakouts and smooths bumpy skin.', ingredients: 'Water, Salicylic Acid (2%), Glycerin, Niacinamide, Zinc PCA, Allantoin, Tea Tree Oil', how_to_use: 'Apply to affected areas after toning. PM use recommended. Use SPF in AM.', volume_ml: 30 },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const file = createWriteStream(dest);
    proto.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return resolve(downloadFile(res.headers.location, dest));
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

function slugify(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80);
}

function parsePrice(price) {
  if (typeof price === 'number') return price;
  return parseFloat(String(price).replace(/[^0-9.]/g, ''));
}

async function uploadToCloudinary(filePath, publicId) {
  const { default: crypto } = await import('crypto');
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = 'skinvault/products';
  const toSign = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${CLOUD_SECRET}`;
  const signature = crypto.createHash('sha1').update(toSign).digest('hex');

  const form = new FormData();
  form.append('file', createReadStream(filePath));
  form.append('api_key', CLOUD_API_KEY);
  form.append('timestamp', timestamp.toString());
  form.append('public_id', publicId);
  form.append('folder', folder);
  form.append('signature', signature);

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudinary.com',
      path: `/v1_1/${CLOUD_NAME}/image/upload`,
      method: 'POST',
      headers: form.getHeaders(),
    };
    const req = https.request(options, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch { reject(new Error('JSON parse failed: ' + body.substring(0, 200))); }
      });
    });
    req.on('error', reject);
    form.pipe(req);
  });
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 SkinVault Product Seeder Starting...\n');

  // 1. Ensure brands exist
  const brandNames = [...new Set(RAW_PRODUCTS.map(p => p.brand))];
  console.log(`📦 Upserting ${brandNames.length} brands...`);
  for (const name of brandNames) {
    const { error } = await supabase.from('brands').upsert(
      { name, slug: slugify(name) },
      { onConflict: 'slug' }
    );
    if (error) console.error(`  ❌ Brand ${name}:`, error.message);
  }
  console.log('  ✅ Brands done\n');

  // 2. Fetch brand + category IDs
  const { data: brands } = await supabase.from('brands').select('id, slug');
  const { data: cats }   = await supabase.from('categories').select('id, slug');
  const brandMap    = Object.fromEntries(brands.map(b => [b.slug, b.id]));
  const categoryMap = Object.fromEntries(cats.map(c => [c.slug, c.id]));

  const catSlugMap = {
    'Toners & Essences': 'toners-essences',
    'Serums':            'serums',
    'Cleansers':         'cleansers',
    'Moisturizers':      'moisturizers',
    'Sunscreen':         'sunscreen',
    'Body Care':         'body-care',
    'Masks & Treatments':'masks-treatments',
  };

  // 3. Process each product
  let success = 0, failed = 0;
  for (let i = 0; i < RAW_PRODUCTS.length; i++) {
    const p = RAW_PRODUCTS[i];
    const slug = slugify(p.name);
    console.log(`[${i+1}/${RAW_PRODUCTS.length}] ${p.name}`);

    // Download image
    const ext = p.img.split('.').pop().split('?')[0].replace('webp','jpg') || 'jpg';
    const localPath = join(IMG_DIR, `${slug}.jpg`);
    let cloudUrl = null;
    let cloudPublicId = null;

    try {
      await downloadFile(p.img, localPath);
      process.stdout.write('  📥 Downloaded → ');

      const cloudRes = await uploadToCloudinary(localPath, slug);
      if (cloudRes.secure_url) {
        cloudUrl = cloudRes.secure_url;
        cloudPublicId = cloudRes.public_id;
        process.stdout.write(`☁️  Cloudinary OK\n`);
      } else {
        console.log(`  ⚠️  Cloudinary failed:`, cloudRes.error?.message);
      }
    } catch (e) {
      console.log(`  ⚠️  Image error:`, e.message);
    }

    // Build product record
    const brandSlug = slugify(p.brand);
    const catSlug   = catSlugMap[p.category] || 'serums';
    const images = cloudUrl ? [{
      public_id: cloudPublicId,
      url: cloudUrl,
      alt: p.name,
      is_primary: true
    }] : [];

    const { error } = await supabase.from('products').upsert({
      name:             p.name,
      slug:             slug,
      brand_id:         brandMap[brandSlug] || null,
      category_id:      categoryMap[catSlug] || null,
      tagline:          p.desc?.split('.')[0] || '',
      description:      p.desc || '',
      ingredients:      p.ingredients || '',
      how_to_use:       p.how_to_use || '',
      skin_types:       p.skin_types || ['all'],
      concerns:         p.concerns || [],
      price:            parsePrice(p.price),
      currency:         'NGN',
      stock:            Math.floor(Math.random() * 40) + 10,
      sku:              `SKV-${String(i+1).padStart(3,'0')}`,
      volume_ml:        p.volume_ml || null,
      weight_g:         p.weight_g  || null,
      is_active:        true,
      is_featured:      ['BESTSELLER','CULT FAVE'].includes(p.tag || ''),
      tag:              p.tag || null,
      cloudinary_folder:'skinvault/products',
      images:           images,
    }, { onConflict: 'slug' });

    if (error) {
      console.log(`  ❌ Supabase error:`, error.message);
      failed++;
    } else {
      console.log(`  ✅ Saved to Supabase`);
      success++;
    }

    // Small delay to be polite to teeka4.com
    await new Promise(r => setTimeout(r, 400));
  }

  console.log(`\n🎉 Done! ${success} products seeded, ${failed} failed.`);
}

main().catch(console.error);

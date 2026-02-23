using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ConstructionManagement.Infrastructure.Data;

/// <summary>
/// Seeder for default product categories in the marketplace
/// </summary>
public static class ProductCategorySeeder
{
    /// <summary>
    /// Default product categories for construction materials
    /// </summary>
    public static readonly (string Name, string NameAr, string? Description, string? Icon, (string Name, string NameAr)[] SubCategories)[] DefaultCategories = new[]
    {
        // مواد البناء الأساسية
        ("Building Materials", "مواد البناء", "Basic construction materials", "building", new[]
        {
            ("Cement", "أسمنت"),
            ("Sand", "رمل"),
            ("Gravel", "حصى"),
            ("Bricks", "طوب"),
            ("Blocks", "بلوك"),
            ("Steel Rebar", "حديد تسليح"),
            ("Concrete", "خرسانة"),
            ("Lime", "جير"),
            ("Gypsum", "جبس"),
            ("Plaster", "بياض")
        }),
        
        // مواد التشطيب
        ("Finishing Materials", "مواد التشطيب", "Interior and exterior finishing materials", "paint-brush", new[]
        {
            ("Paints", "دهانات"),
            ("Wallpaper", "ورق حائط"),
            ("Ceramic Tiles", "سيراميك"),
            ("Porcelain Tiles", "بورسلين"),
            ("Marble", "رخام"),
            ("Granite", "جرانيت"),
            ("Parquet", "باركيه"),
            ("Laminate Flooring", "أرضيات لامينيت"),
            ("Wall Cladding", "كسرات حوائط"),
            ("Ceiling Materials", "أسقف معلقة")
        }),
        
        // أبواب وشبابيك
        ("Doors & Windows", "أبواب وشبابيك", "Doors, windows and accessories", "door-open", new[]
        {
            ("Wooden Doors", "أبواب خشب"),
            ("Metal Doors", "أبواب معدنية"),
            ("PVC Doors", "أبواب PVC"),
            ("Aluminum Windows", "شبابيك ألومنيوم"),
            ("PVC Windows", "شبابيك PVC"),
            ("Glass Doors", "أبواب زجاجية"),
            ("Sliding Doors", "أبواب منزلقة"),
            ("Security Doors", "أبواب أمان"),
            ("Door Handles", "مقابض أبواب"),
            ("Window Accessories", "اكسسوارات شبابيك")
        }),
        
        // أدوات صحية
        ("Sanitary Ware", "أدوات صحية", "Bathroom and kitchen fixtures", "faucet", new[]
        {
            ("Toilets", "مراحيض"),
            ("Washbasins", "أحواض غسيل"),
            ("Bathtubs", "بانيو"),
            ("Shower Cabins", "كبائن شاور"),
            ("Shower Heads", "شطافات"),
            ("Faucets", "خلاطات"),
            ("Kitchen Sinks", "أحواض مطبخ"),
            ("Bathroom Accessories", "اكسسوارات حمام"),
            ("Water Heaters", "سخانات مياه"),
            ("Bathroom Mirrors", "مرايا حمام")
        }),
        
        // تمديدات صحية
        ("Plumbing Supplies", "تمديدات صحية", "Pipes, fittings and plumbing materials", "wrench", new[]
        {
            ("PVC Pipes", "مواسير PVC"),
            ("Copper Pipes", "مواسير نحاس"),
            ("PPR Pipes", "مواسير PPR"),
            ("Pipe Fittings", "وصلات مواسير"),
            ("Valves", "محابس"),
            ("Water Pumps", "طلمبات مياه"),
            ("Drainage Systems", "صرف صحي"),
            ("Water Tanks", "خزانات مياه"),
            ("Insulation Materials", "عوازل"),
            ("Plumbing Tools", "أدوات سباكة")
        }),
        
        // كهرباء
        ("Electrical Supplies", "مستلزمات كهربائية", "Electrical materials and equipment", "bolt", new[]
        {
            ("Wires & Cables", "أسلاك وكابلات"),
            ("Switches", "مفاتيح"),
            ("Sockets", "فيش وبريز"),
            ("Circuit Breakers", "قواطع كهربائية"),
            ("Distribution Boards", "لوحات توزيع"),
            ("Lighting Fixtures", "وحدات إنارة"),
            ("LED Lights", "إضاءة LED"),
            ("Outdoor Lighting", "إضاءة خارجية"),
            ("Electrical Panels", "لوحات كهربائية"),
            ("Generators", "مولدات")
        }),
        
        // عزل ومواد عازلة
        ("Insulation Materials", "مواد العزل", "Thermal and waterproofing insulation", "shield-alt", new[]
        {
            ("Thermal Insulation", "عزل حراري"),
            ("Waterproofing", "عزل مائي"),
            ("Sound Insulation", "عزل صوتي"),
            ("Foam Insulation", "عزل فوم"),
            ("Bitumen", "بيتومين"),
            ("Insulation Membranes", "أغشية عازلة"),
            ("Sealants", "مواد سد"),
            ("Weather Stripping", "شرائط عزل"),
            ("Vapor Barriers", "حواجز بخار"),
            ("Insulation Tapes", "أشرطة عزل")
        }),
        
        // أدوات ومعدات
        ("Tools & Equipment", "أدوات ومعدات", "Construction tools and equipment", "tools", new[]
        {
            ("Hand Tools", "أدوات يدوية"),
            ("Power Tools", "أدوات كهربائية"),
            ("Measuring Tools", "أدوات قياس"),
            ("Safety Equipment", "معدات سلامة"),
            ("Scaffolding", "سقالات"),
            ("Ladders", "سلالم"),
            ("Mixers", "خلاطات"),
            ("Grinders", "طواحين"),
            ("Drills", "مثاقب"),
            ("Welding Equipment", "معدات لحام")
        }),
        
        // أخشاب
        ("Wood & Timber", "أخشاب", "Wood products and timber", "tree", new[]
        {
            ("Plywood", "خشب بليود"),
            ("MDF", "خشب MDF"),
            ("Solid Wood", "خشب طبيعي"),
            ("Particle Board", "خشب معالج"),
            ("Wood Panels", "ألواح خشب"),
            ("Moldings", "زخارف خشب"),
            ("Wood Flooring", "أرضيات خشب"),
            ("Decking", "ديكينج"),
            ("Timber Beams", "كمر خشب"),
            ("Wood Finishes", "تشطيبات خشب")
        }),
        
        // معادن
        ("Metals", "معادن", "Metal products and supplies", "cog", new[]
        {
            ("Steel Sheets", "ألواح صلب"),
            ("Aluminum Profiles", "ألومنيوم"),
            ("Copper Sheets", "ألواح نحاس"),
            ("Metal Pipes", "مواسير معدنية"),
            ("Angle Iron", "زوايا حديد"),
            ("Metal Mesh", "شبك معدني"),
            ("Nails & Screws", "مسامير وبراغي"),
            ("Bolts & Nuts", "صواميل وبراغي"),
            ("Metal Brackets", "أقواس معدنية"),
            ("Wire Rope", "حبال سلك")
        }),
        
        // دهانات
        ("Paints & Coatings", "دهانات وطلاء", "Paint products and coatings", "paint-roller", new[]
        {
            ("Interior Paints", "دهانات داخلية"),
            ("Exterior Paints", "دهانات خارجية"),
            ("Primers", "بريمر"),
            ("Varnishes", "ورنيش"),
            ("Wood Stains", "ملونات خشب"),
            ("Epoxy Coatings", "طلاء إيبوكسي"),
            ("Waterproof Paints", "دهانات عازلة"),
            ("Texture Paints", "دهانات محبرة"),
            ("Spray Paints", "دهانات رش"),
            ("Paint Accessories", "أدوات دهان")
        }),
        
        // لاندسكيب
        ("Landscaping", "لاندسكيب", "Outdoor and landscaping materials", "leaf", new[]
        {
            ("Pavers", "إنترلوك"),
            ("Artificial Grass", "عشب صناعي"),
            ("Natural Grass", "عشب طبيعي"),
            ("Garden Stones", "أحجار حدائق"),
            ("Fencing", "أسوار"),
            ("Garden Lighting", "إضاءة حدائق"),
            ("Irrigation Systems", "نظم ري"),
            ("Planters", "أصيص"),
            ("Outdoor Furniture", "أثاث خارجي"),
            ("Decorative Rocks", "صخور ديكور")
        })
    };

    /// <summary>
    /// Seed default product categories
    /// </summary>
    public static async Task SeedCategoriesAsync(ApplicationDbContext context, ILogger? logger = null)
    {
        // Check if categories already exist
        var existingCategories = await context.ProductCategories
            .Where(c => c.IsSystemCategory)
            .ToListAsync();

        if (existingCategories.Any())
        {
            logger?.LogInformation("System categories already exist. Skipping seeding.");
            return;
        }

        int sortOrder = 0;
        foreach (var (name, nameAr, description, icon, subCategories) in DefaultCategories)
        {
            // Create main category
            var mainCategory = new ProductCategory
            {
                Name = name,
                NameAr = nameAr,
                Description = description,
                Icon = icon,
                IsApproved = true,
                IsSystemCategory = true,
                SortOrder = sortOrder++
            };
            context.ProductCategories.Add(mainCategory);
            await context.SaveChangesAsync();

            logger?.LogInformation("Created main category: {Name} ({NameAr})", name, nameAr);

            // Create subcategories
            int subSortOrder = 0;
            foreach (var (subName, subNameAr) in subCategories)
            {
                var subCategory = new ProductCategory
                {
                    Name = subName,
                    NameAr = subNameAr,
                    ParentCategoryId = mainCategory.Id,
                    IsApproved = true,
                    IsSystemCategory = true,
                    SortOrder = subSortOrder++
                };
                context.ProductCategories.Add(subCategory);
            }
            await context.SaveChangesAsync();

            logger?.LogInformation("Created {Count} subcategories for {Name}", subCategories.Length, name);
        }

        logger?.LogInformation("Product category seeding completed. Total main categories: {Count}", DefaultCategories.Length);
    }
}

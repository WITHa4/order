var brands = [
  { id: "bajaj", name: "Bajaj", logo: "images/logo/bajaj.png", description: "Mixer Grinders, Wet Grinders, Irons, Water Heaters, Air Coolers" },
  { id: "havells", name: "Havells", logo: "images/logo/havells.png", description: "Ceiling Fans, Stand Fans, Wall Fans (Remote & Non-Remote)" },
  { id: "range", name: "Range", logo: "images/logo/range.png", description: "Blenders, Mixer Grinders, Stand Fans, Wall Fans, Ovens & more" },
  { id: "jinling", name: "Jinling", logo: "images/logo/jinling.png", description: "Industrial Stand & Wall Fans, Ventilation Fans, Orbit Fans" },
  { id: "favina", name: "favina", logo: "", description: "Industrial Stand Fans & Wall Fans" },
  { id: "ion", name: "ION", logo: "images/logo/ion.png", description: "Stand Fans and Mixer Grinders" },
  { id: "voltas", name: "Voltas", logo: "images/logo/Voltas.png", description: "Premium Inverter & Non-Inverter Air Conditioners" },
  { id: "liper", name: "Liper", logo: "images/logo/liper.png", description: "Premium LED Lights & Lighting Solutions" }
];

var products = [
  // BAJAJ
  {
    brand: "bajaj", item: "BAJAJ PMH AIR COOLER", description: "BAJAJ AIR COOLER TANK SERIES", variants: [
      { name: "PMH-12 (12L)", price: "42,000" },
      { name: "PMH-18 (18L)", price: "46,000" },
      { name: "PMH-25 (25L)", price: "35,850" }
    ]
  },
  {
    brand: "bajaj", item: "BAJAJ SHIELD AIR COOLER", description: "BAJAJ AIR COOLER TANK SERIES (LARGE)", variants: [
      { name: "SHIELD-45 (45L)", price: "60,000" },
      { name: "SHIELD-55 (55L)", price: "81,666" },
      { name: "SHIELD-67 (67L)", price: "98,333" }
    ]
  },
  {
    brand: "bajaj", item: "BAJAJ TMH TOWER COOLER", description: "BAJAJ AIR COOLER TOWER SERIES", variants: [
      { name: "TMH12 (12L)", price: "58,333" },
      { name: "TMH20 (20L)", price: "45,000" },
      { name: "TMH35 (35L)", price: "48,500" }
    ]
  },
  { brand: "bajaj", item: "CANVAS DRY IRON", description: "BAJAJ MATLIC DRY IRON 1000W (2YRS)", price: "5,500", colors: ["Blue", "Red"] },
  { brand: "bajaj", item: "DX2 BLACK", description: "BAJAJ DRY IRON 600W (2YRS)", price: "5,500" },
  { brand: "bajaj", item: "DX7 NEO", description: "BAJAJ DRY IRON 1000W (2YRS)", price: "6,100" },
  { brand: "bajaj", item: "POPULAR-1000", description: "BAJAJ DRY IRON 1000W (2YRS)", price: "5,800" },
  { brand: "bajaj", item: "DHX9", description: "BAJAJ HEAVY IRON-1000W(2YRS)", price: "6,250" },
  { brand: "bajaj", item: "MX3 NEO", description: "BAJAJ SPRAY IRON 1250 WATTS (2YRS)", price: "11,083" },
  {
    brand: "bajaj", item: "BAJAJ MIXER GRINDER", description: "PREMIUM BAJAJ MIXER GRINDERS", variants: [
      { name: "ELEGANT-500", price: "24,166" },
      { name: "3JAR VIRTUE", price: "29,416" },
      { name: "4JAR VIRTUE", price: "32,600" },
      { name: "CARVE-750", price: "20,000" },
      { name: "FINESSE-750", price: "21,175" },
      { name: "EVOQUE-1000", price: "29,100" }
    ]
  },
  {
    brand: "bajaj", item: "BAJAJ WET GRINDER", description: "BAJAJ WET GRINDER SERIES - 2L", variants: [
      { name: "WX 1", price: "36,450" },
      { name: "WX 3", price: "38,990" },
      { name: "WX 9", price: "48,500" }
    ]
  },
  { brand: "bajaj", item: "MX-45", description: "BAJAJ STEAM IRON-2YRS W", price: "8,960" },
  {
    brand: "bajaj", item: "BAJAJ ASTOR WATER HEATER", description: "BAJAJ WATER HEATER ASTOR SERIES", variants: [
      { name: "ASTOR 15L", price: "85,000" },
      { name: "ASTOR 25L", price: "88,333" }
    ]
  },
  { brand: "bajaj", item: "FLASHY 3 KW", description: "BAJAJ 3KW INSTANT WATER HEATER", price: "51,666" },
  { brand: "bajaj", item: "FLORA 1L", description: "BAJAJ 3KW-1L INSTANT WATER HEATER", price: "51,666" },
  { brand: "bajaj", item: "JUVEL 3KW", description: "BAJAJ 3KW-3L INSTANT WATER HEATER", price: "39,166" },
  { brand: "bajaj", item: "MANTILLA 10L", description: "BAJAJ 10L WATER HEATER", price: "57,500" },
  {
    brand: "bajaj", item: "BAJAJ SHAKTHI WATER HEATER", description: "BAJAJ SHAKTHI DELUX SERIES", variants: [
      { name: "SHAKTHI 15L", price: "85,000" },
      { name: "SHAKTHI 25L", price: "88,333" }
    ]
  },

  // FAVINA
  { brand: "favina", item: "FAVINA-FS4505M", description: "VIETNAM INDUSTRIAL STAND FAN-18\" 65W", price: "21,083" },
  { brand: "favina", item: "FAVINA-FW4003", description: "VIETNAM WALLFAN-16\" 45W", price: "13,917" },

  // HAVELLS
  { brand: "havells", item: "RIGA-1200", description: "HAVELLS CEILLING FAN 1200MM", price: "16,166", colors: ["Bianco", "Brown", "Smoke Brown", "White"] },
  { brand: "havells", item: "CREW-1400", description: "HAVELLS CEILLING FAN 1400MM", price: "16,666", colors: ["Black", "Brown", "Ivory", "Smoke Brown", "White"] },
  { brand: "havells", item: "RIGA-1400", description: "HAVELLS CEILLING FAN 1400MM", price: "15,833", colors: ["Black", "Brown", "Ivory", "Smoke Brown", "White"] },
  { brand: "havells", item: "SAMARAAT-600", description: "HAVELLS CEILLING FAN 600MM", price: "12,000", colors: ["Brown", "White"] },
  { brand: "havells", item: "SAMARAAT-900", description: "HAVELLS CEILLING FAN 900MM", price: "15,000", colors: ["Brown", "White", "Matte Black"] },
  { brand: "havells", item: "GYRO CABIN-400", description: "HAVELLS CHINEASE CABIN FAN 400MM", price: "17,780" },
  { brand: "havells", item: "FRESCO PEDESTAL-400", description: "HAVELLS PEDESTAL FAN 4 SPEED-400MM(16\")", price: "18,650" },
  { brand: "havells", item: "KOOLAIR-400 REMOTE", description: "HAVELLS PEDESTAL FAN WITH REMOTE", price: "20,850" },
  { brand: "havells", item: "RIGO PEDESTAL-400", description: "HAVELLS PEDESTAL FAN - 3PEED -400MM", price: "18,250" },
  { brand: "havells", item: "SPRINT REMOTE-400MM", description: "HAVELLS REMOTE PEDESTAL -400MM", price: "21,666" },
  { brand: "havells", item: "SWING PEDESTAL-400MM", description: "HAVELLS PEDESTAL-400MM", price: "20,833" },
  {
    brand: "havells", item: "T FORCE INDUSTRIAL", description: "HAVELLS HEAVY DUTY AIR VENTILATION SERIES", variants: [
      { name: "T FORCE-600 (24\")", price: "91,666" },
      { name: "T FORCE EX-380 (15\")", price: "30,833" },
      { name: "T FORCE EX-450 (18\")", price: "60,000" },
      { name: "T FORCE NEO-450 (18\")", price: "47,500" },
      { name: "T FORCE NEO-600 (24\")", price: "78,333" }
    ]
  },
  {
    brand: "havells", item: "HAVELLS VENTIL AIR", description: "AIR VENTILATION FAN SERIES (STEEL/PLASTIC)", variants: [
      { name: "DSP-230 (9\")", price: "13,333" },
      { name: "DSP-300 (12\")", price: "15,833" },
      { name: "DX-150 (6\")", price: "9,166" },
      { name: "DX-200 (8\")", price: "9,750" },
      { name: "DX-250 (10\")", price: "12,500" }
    ]
  },
  { brand: "havells", item: "ORO WALL REMOTE", description: "HAVELLS WALL FAN WITH REMOTE 400MM", price: "19,166" },
  { brand: "havells", item: "PLATINA REMOTE-400", description: "HAVELLS WALL FAN REMOTE-400MM", price: "20,200" },
  { brand: "havells", item: "PLATINA WALL-400", description: "HAVELLS WALL FANS 400MM", price: "16,800" },
  { brand: "havells", item: "CELIA-1400", description: "HAVELLS DECORATIVE CEILING FAN 1400MM", price: "18,100", colors: ["Elegant White", "Grey Blue WT", "Midnight Black", "Smoke Brown", "White Gold"] },
  { brand: "havells", item: "FESTIVA PRIME-1400", description: "HAVELLS DECORATIVE CEILING FAN 1400MM", price: "19,200", colors: ["Beige", "Brown", "Dusk", "Elegant", "Rose"] },

  // ION
  {
    brand: "ion", item: "ION MIXER GRINDER", description: "ION MIXER GRINDER 550W SERIES", variants: [
      { name: "IMG-001", price: "10,500" },
      { name: "IMG-002", price: "9,916" }
    ]
  },
  {
    brand: "ion", item: "ION STAND FAN", description: "ION STAND FAN 55W WITH TIMER SERIES", variants: [
      { name: "ISF-001", price: "10,500" },
      { name: "ISF-002", price: "10,500" }
    ]
  },

  // JINLING
  {
    brand: "jinling", item: "JINLING AIR CURTAIN", description: "JINLING AIR CURTAIN SERIES (36\"-48\")", variants: [
      { name: "FM-1209K (36\")", price: "50,660" },
      { name: "FM-1212K (48\")", price: "58,400" }
    ]
  },
  { brand: "jinling", item: "FD-40C", description: "JINLING CABIN FAN-16\"", price: "16,667" },
  {
    brand: "jinling", item: "JINLING INDUSTRIAL STAND FAN", description: "HEAVY DUTY INDUSTRIAL STAND FANS", variants: [
      { name: "FS2-50X (20\")", price: "43,410" },
      { name: "FS2-65X (26\")", price: "49,200" },
      { name: "FS2-75X (30\")", price: "54,900" }
    ]
  },
  {
    brand: "jinling", item: "JINLING INDUSTRIAL WALL FAN", description: "HEAVY DUTY INDUSTRIAL WALL FANS", variants: [
      { name: "FB2-50X (20\")", price: "39,600" },
      { name: "FB2-65X (26\")", price: "45,150" },
      { name: "FB2-75X (30\")", price: "50,650" }
    ]
  },
  { brand: "jinling", item: "FS40-YC7", description: "JINLING STAND FAN-55W-7 BLADE", price: "18,750" },
  {
    brand: "jinling", item: "JINLING VENTILATION", description: "JINLING VENTILATION FAN SERIES", variants: [
      { name: "APB-15 (6\")", price: "8,050" },
      { name: "APB-20 (8\")", price: "9,250" },
      { name: "APB-25 (10\")", price: "11,100" },
      { name: "APB-30 (12\")", price: "13,100" }
    ]
  },
  { brand: "jinling", item: "FB40-YAC", description: "JINLING WALL FAN-16\"", price: "17,500" },

  // RANGE
  {
    brand: "range", item: "RANGE BLENDER", description: "RANGE ELECTRIK BLENDER 1.7L SERIES", variants: [
      { name: "REB-031", price: "8,565" },
      { name: "REB-032", price: "7,820" }
    ]
  },
  {
    brand: "range", item: "RANGE CEILING BOX FAN", description: "RANGE CEILING BOX FAN LED SERIES", variants: [
      { name: "RCBF-001L", price: "19,200", image: "images/Fan/RCBF-001L.png" },
      { name: "RCBF-002L", price: "20,033", image: "images/Fan/RCBF-002L.png" }
    ]
  },
  {
    brand: "range", item: "RANGE DRY IRON", description: "AUTOMATIC DRY IRON SERIES", variants: [
      { name: "RDI-004", price: "3,500", image: "images/Iron/RDI-004.png" },
      { name: "RDI-005", price: "3,666", image: "images/Iron/RDI-005.png" }
    ]
  },
  {
    brand: "range", item: "RANGE HEAVY IRON", description: "RANGE HEAVY IRON SERIES", variants: [
      { name: "RHI 002 (NORMAL)", price: "4,985" },
      { name: "RHI 002M (MINI)", price: "4,625" },
      { name: "RHI 003", price: "4,625" },
      { name: "RHI-004", price: "5,615" },
      { name: "RHI-006", price: "5,455" },
      { name: "RHI-007", price: "4,000" }
    ]
  },
  {
    brand: "range", item: "RANGE MIXER GRINDER", description: "RANGE MIXER GRINDER SERIES", variants: [
      { name: "RMG-028 (3 JAR)", price: "15,835" },
      { name: "RMG-029 (3 JAR)", price: "19,950" },
      { name: "RMG-026 (INDIAN)", price: "13,335" },
      { name: "RMG-027 (4 JAR)", price: "14,666" }
    ]
  },
  {
    brand: "range", item: "RANGE ELECTRIC OVEN (REO)", description: "RANGE REO SERIES OVEN", variants: [
      { name: "REO-018 (18L)", price: "20,833", image: "images/Oven/REO-018.jpg" },
      { name: "REO-023 (23L)", price: "24,000" },
      { name: "REO-032 (32L)", price: "27,750" },
      { name: "REO-045 (45L)", price: "33,020", image: "images/Oven/REO-045.jpg" },
      { name: "REO-060 (60L)", price: "37,950" },
      { name: "REO-070 (70L)", price: "44,300" }
    ]
  },
  {
    brand: "range", item: "RANGE OVEN (SN/TO)", description: "ECONOMY RANGE OVEN SERIES", variants: [
      { name: "SN-13B", price: "18,000" },
      { name: "SN-18G", price: "20,000" },
      { name: "TO-25G", price: "21,610" },
      { name: "TO-35G", price: "25,000" }
    ]
  },
  {
    brand: "range", item: "RANGE SANDWICH MAKER / GRILL", description: "RANGE GRILL & SANDWICH MAKER SERIES", variants: [
      { name: "RGSM-002 (GRILL)", price: "12,230" },
      { name: "RSM-007 (GRILL)", price: "4,480" },
      { name: "RSM-008 (SANDWICH)", price: "4,900" },
      { name: "RSM-009 (COMBO)", price: "7,905" }
    ]
  },
  {
    brand: "range", item: "RANGE STAND FAN", description: "RANGE STAND FAN 55W WITH TIMER", variants: [
      { name: "RSF-025", price: "11,667" },
      { name: "RSF-026", price: "11,667" },
      { name: "RSF-027", price: "12,000" },
      { name: "RSF-028", price: "12,000" }
    ]
  },
  { brand: "range", item: "RSF-030", description: "RANGE ELECTRIC STAND FAN 55W", price: "14,640" },
  { brand: "range", item: "RISF-001", description: "RANGE ELECTRIC STAND FAN 110W(18\")", price: "17,700" },
  { brand: "range", item: "RTF-030", description: "RANGE ELECTRIC TABLE FAN 50W", price: "9,400" },
  { brand: "range", item: "RWF-020R", description: "ELECTRIC WALL FAN 55 WATT", price: "12,500" },
  { brand: "range", item: "RWF-021", description: "WALL FAN", price: "10,800" },
  {
    brand: "range", item: "RANGE WATER DISPENSER", description: "RANGE WATER DISPENSER SERIES", variants: [
      { name: "RWD-003S (COMP)", price: "50,100", image: "images/Water Dispenser/RWD-003S.jpg" },
      { name: "RWD-004TE (TABLE)", price: "31,310" },
      { name: "RWD-005SE (STAND)", price: "33,585" }
    ]
  },

  // VOLTAS
  {
    brand: "voltas", item: "VOLTAS NON-INVERTER AC", description: "VOLTAS PREMIUM AC (NON-INVERTER)", variants: [
      { name: "12FE (12,000 BTU)", price: "174,990" },
      { name: "18FE (18,000 BTU)", price: "187,990" },
      { name: "24FE (24,000 BTU)", price: "244,990" }
    ]
  },
  {
    brand: "voltas", item: "VOLTAS INVERTER AC", description: "VOLTAS PREMIUM AC (INVERTER)", variants: [
      { name: "12VE (12,000 BTU)", price: "196,990" },
      { name: "18VE (18,000 BTU)", price: "226,990" },
      { name: "24VE (24,000 BTU)", price: "286,990" }
    ]
  },
];

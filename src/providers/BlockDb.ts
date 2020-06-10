
const db = {
air: 'Air',
invisiblebedrock: 'Invisible Bedrock',
stone: 'Stone',
smooth_stone: 'Smooth Stone',
grass: 'Grass Block',
dirt: 'Dirt',
cobblestone: 'Cobblestone',
planks: 'Wood Planks',
sapling: 'Sapling',
bedrock: 'Bedrock',
flowing_water: 'Water',
water: 'Stationary Water',
flowing_lava: 'Lava',
lava: 'Stationary Lava',
sand: 'Sand',
gravel: 'Gravel',
gold_ore: 'Gold Ore',
iron_ore: 'Iron Ore',
coal_ore: 'Coal Ore',
log: 'Log',
leaves: 'Leaves',
sponge: 'Sponge',
glass: 'Glass',
lapis_ore: 'Lapis Lazuli Ore',
lapis_block: 'Lapis Lazuli Block',
dispenser: 'Dispenser',
sandstone: 'Sandstone',
noteblock: 'Note Block',
bed: 'Bed',
golden_rail: 'Powered Rail',
detector_rail: 'Detector Rail',
sticky_piston: 'Sticky Piston',
web: 'Cobweb',
tallgrass: 'Tall Grass',
deadbush: 'Dead Bush',
piston: 'Piston',
pistonarmcollision: 'Piston Head',
wool: 'Wool',
element_0: 'Unknown Element (???)',
yellow_flower: 'Dandelion',
red_flower: 'Flower',
brown_mushroom: 'Brown Mushroom',
red_mushroom: 'Red Mushroom',
gold_block: 'Block of Gold',
iron_block: 'Block of Iron',
double_stone_slab: 'Double Stone Slab',
stone_slab: 'Stone Slab',
brick_block: 'Brick Block',
tnt: 'TNT',
bookshelf: 'Bookshelf',
mossy_cobblestone: 'Mossy Cobblestone',
obsidian: 'Obsidian',
torch: 'Torch',
fire: 'Fire',
mob_spawner: 'Spawner',
oak_stairs: 'Oak Stairs',
chest: 'Chest N',
redstone_wire: 'Redstone Wire',
diamond_ore: 'Diamond Ore',
diamond_block: 'Block of Diamond',
crafting_table: 'Crafting Table',
wheat: 'Wheat Crops',
farmland: 'Farmland',
furnace: 'Furnace N',
lit_furnace: 'Burning Lit Furnace N',
standing_sign: 'Oak Standing Sign',
oak_door: 'Oak Door',
ladder: 'Ladder',
rail: 'Rail',
stone_stairs: 'Cobblestone Stairs',
wall_sign: 'Oak Wall Sign',
lever: 'Lever',
stone_pressure_plate: 'Stone Pressure Plate',
iron_door: 'Iron Door',
wooden_pressure_plate: 'Oak Pressure Plate',
redstone_ore: 'Redstone Ore',
lit_redstone_ore: 'Glowing Redstone Ore',
unlit_redstone_torch: 'Unlit Redstone Torch',
redstone_torch: 'Redstone Torch',
stone_button: 'Stone Button',
snow_layer: 'Top Snow',
ice: 'Ice',
snow: 'Snow',
cactus: 'Cactus',
clay: 'Clay',
reeds: 'Sugar Cane',
jukebox: 'Jukebox',
fence: 'Oak Fence',
pumpkin: 'Pumpkin',
netherrack: 'Netherrack',
soul_sand: 'Soul Sand',
glowstone: 'Glowstone',
portal: 'Portal',
lit_pumpkin: "Jack o'Lantern",
cake: 'Cake',
unpowered_repeater: 'Redstone Repeater',
powered_repeater: 'Active Redstone Repeater',
wooden_trapdoor: 'Oak Trapdoor',
monster_egg: 'Monster Egg',
stonebrick: 'Stone Bricks',
brown_mushroom_block: 'Brown Mushroom Block',
red_mushroom_block: 'Red Mushroom Block',
iron_bars: 'Iron Bars',
glass_pane: 'Glass Pane',
melon_block: 'Melon',
pumpkin_stem: 'Pumpkin Stem',
melon_stem: 'Melon Stem',
vine: 'Vines',
fence_gate: 'Oak Fence Gate',
brick_stairs: 'Brick Stairs',
stone_brick_stairs: 'Stone Brick Stairs',
mycelium: 'Mycelium',
waterlily: 'Lily Pad',
nether_brick_block: 'Nether Brick Block',
nether_brick_fence: 'Nether Brick Fence',
nether_brick_stairs: 'Nether Brick Stairs',
nether_wart: 'Nether Wart',
enchanting_table: 'Enchantment Table',
brewing_stand: 'Brewing Stand N',
cauldron: 'Cauldron B',
end_portal: 'End Portal',
end_portal_frame: 'End Portal Frame',
end_stone: 'End Stone',
dragon_egg: 'Dragon Egg',
redstone_lamp: 'Redstone Lamp (inactive)',
lit_redstone_lamp: 'Redstone Lamp (active)',
dropper: 'Dropper',
activator_rail: 'Activator Rail',
cocoa: 'Cocoa',
sandstone_stairs: 'Sandstone Stairs',
emerald_ore: 'Emerald Ore',
ender_chest: 'Ender Chest',
tripwire_hook: 'Tripwire Hook',
tripwire: 'Tripwire',
emerald_block: 'Block of Emerald',
spruce_stairs: 'Spruce Stairs',
birch_stairs: 'Birch Stairs',
jungle_stairs: 'Jungle Stairs',
command_block: 'Impulse Command Block N',
beacon: 'Beacon',
cobblestone_wall: 'Cobblestone Wall',
flower_pot: 'Flower Pot',
carrots: 'Carrots',
potatoes: 'Potatoes',
wooden_button: 'Oak Button',
skull: 'Mob head',
anvil: 'Anvil',
trapped_chest: 'Trapped Chest N',
light_weighted_pressure_plate: 'Weighted Pressure Plate (Light)',
heavy_weighted_pressure_plate: 'Weighted Pressure Plate (Heavy)',
unpowered_comparator: 'Redstone Comparator (unpowered)',
powered_comparator: 'Redstone Comparator (powered)',
daylight_detector: 'Daylight Sensor',
redstone_block: 'Block of Redstone',
quartz_ore: 'Nether Quartz Ore',
hopper: 'Hopper N',
quartz_block: 'Block of Quartz',
quartz_stairs: 'Quartz Stairs',
double_wooden_slab: 'Wooden Double Slab',
wooden_slab: 'Wooden Slab',
stained_hardened_clay: 'Terracotta',
stained_glass_pane: 'Stained Glass Pane',
leaves2: 'Acacia Leaves',
log2: 'Acacia Log',
acacia_stairs: 'Acacia Stairs',
dark_oak_stairs: 'Dark Oak Stairs',
slime: 'Slime Block',
glow_stick: 'Glow Stick D',
iron_trapdoor: 'Iron Trapdoor',
prismarine: 'Prismarine',
sealantern: 'Sea Lantern',
hay_block: 'Hay Bale',
carpet: 'Carpet',
hardened_clay: 'Terracotta',
coal_block: 'Block of Coal',
packed_ice: 'Packed Ice',
double_plant: 'Sunflower',
standing_banner: 'Standing Banner',
wall_banner: 'Wall Banner',
daylight_detector_inverted: 'Inverted Daylight Detector',
red_sandstone: 'Red Sandstone',
red_sandstone_stairs: 'Red Sandstone Stairs',
double_stone_slab2: 'Double Red Sandstone Slab',
stone_slab2: 'Red Sandstone Slab',
spruce_fence_gate: 'Spruce Fence Gate',
birch_fence_gate: 'Birch Fence Gate',
jungle_fence_gate: 'Jungle Fence Gate',
dark_oak_fence_gate: 'Dark Oak Fence Gate',
acacia_fence_gate: 'Acacia Fence Gate',
repeating_command_block: 'Repeating Command Block N',
chain_command_block: 'Chain Command Block N',
hard_glass_pane: 'Hardened Glass Pane',
hard_stained_glass_pane: 'Hardened Stained Glass Pane',
chemical_heat: 'Heat Block',
spruce_door: 'Spruce Door',
birch_door: 'Birch Door',
jungle_door: 'Jungle Door',
acacia_door: 'Acacia Door',
dark_oak_door: 'Dark Oak Door',
grass_path: 'Grass Path',
frame: 'Item Frame',
chorus_flower: 'Chorus Flower',
purpur_block: 'Purpur Block',
colored_torch_rg: 'Red Torch',
purpur_stairs: 'Purpur Stairs',
colored_torch_bp: 'Blue Torch',
undyed_shulker_box: 'Shulker Box (Undyed) N',
end_bricks: 'End Stone Bricks',
frosted_ice: 'Frosted Ice',
end_rod: 'End Rod',
end_gateway: 'End Gateway',
allow: 'Allow',
deny: 'Deny',
border_block: 'Border',
magma: 'Magma Block',
nether_wart_block: 'Nether Wart Block',
red_nether_brick: 'Red Nether Brick',
bone_block: 'Bone Block',
structure_void: 'Structure Void',
shulker_box: 'Shulker Box B N',
purple_glazed_terracotta: 'Purple Glazed Terracotta',
white_glazed_terracotta: 'White Glazed Terracotta',
orange_glazed_terracotta: 'Orange Glazed Terracotta',
magenta_glazed_terracotta: 'Magenta Glazed Terracotta',
light_blue_glazed_terracotta: 'Light Blue Glazed Terracotta',
yellow_glazed_terracotta: 'Yellow Glazed Terracotta',
lime_glazed_terracotta: 'Lime Glazed Terracotta',
pink_glazed_terracotta: 'Pink Glazed Terracotta',
gray_glazed_terracotta: 'Gray Glazed Terracotta',
silver_glazed_terracotta: 'Light Gray Glazed Terracotta',
cyan_glazed_terracotta: 'Cyan Glazed Terracotta',
blue_glazed_terracotta: 'Blue Glazed Terracotta',
brown_glazed_terracotta: 'Brown Glazed Terracotta',
green_glazed_terracotta: 'Green Glazed Terracotta',
red_glazed_terracotta: 'Red Glazed Terracotta',
black_glazed_terracotta: 'Black Glazed Terracotta',
concrete: 'Concrete',
concretepowder: 'Concrete Powder',
chemistry_table: 'Compound Creator',
underwater_torch: 'Underwater Torch',
chorus_plant: 'Chorus Plant',
stained_glass: 'Stained Glass',
camera: 'Camera [note 1]',
podzol: 'Podzol',
beetroot: 'Beetroots',
stonecutter: 'Stonecutter',
glowingobsidian: 'Glowing Obsidian',
netherreactor: 'Nether Reactor Core',
info_update: 'Update Game Block (update!) [note 2]',
info_update2: 'Update Game Block (ate!upd)',
observer: 'Observer',
structure_block: 'Structure Block',
hard_glass: 'Hardened Glass',
hard_stained_glass: 'Hardened Stained Glass',
reserved6: 'reserved6',
prismarine_stairs: 'Prismarine Stairs',
dark_prismarine_stairs: 'Dark Prismarine Stairs',
prismarine_bricks_stairs: 'Prismarine Brick Stairs',
stripped_spruce_log: 'Stripped Spruce Log',
stripped_birch_log: 'Stripped Birch Log',
stripped_jungle_log: 'Stripped Jungle Log',
stripped_acacia_log: 'Stripped Acacia Log',
stripped_dark_oak_log: 'Stripped Dark Oak Log',
stripped_oak_log: 'Stripped Oak Log',
blue_ice: 'Blue Ice',
element_1: 'Hydrogen',
element_2: 'Helium',
element_3: 'Lithium',
element_4: 'Beryllium',
element_5: 'Boron',
element_6: 'Carbon',
element_7: 'Nitrogen',
element_8: 'Oxygen',
element_9: 'Fluorine',
element_10: 'Neon',
element_11: 'Sodium',
element_12: 'Magnesium',
element_13: 'Aluminum',
element_14: 'Silicon',
element_15: 'Phosphorus',
element_16: 'Sulfur',
element_17: 'Chlorine',
element_18: 'Argon',
element_19: 'Potassium',
element_20: 'Calcium',
element_21: 'Scandium',
element_22: 'Titanium',
element_23: 'Vanadium',
element_24: 'Chromium',
element_25: 'Manganese',
element_26: 'Iron',
element_27: 'Cobalt',
element_28: 'Nickel',
element_29: 'Copper',
element_30: 'Zinc',
element_31: 'Gallium',
element_32: 'Germanium',
element_33: 'Arsenic',
element_34: 'Selenium',
element_35: 'Bromine',
element_36: 'Krypton',
element_37: 'Rubidium',
element_38: 'Strontium',
element_39: 'Yttrium',
element_40: 'Zirconium',
element_41: 'Niobium',
element_42: 'Molybdenum',
element_43: 'Technetium',
element_44: 'Ruthenium',
element_45: 'Rhodium',
element_46: 'Palladium',
element_47: 'Silver',
element_48: 'Cadmium',
element_49: 'Indium',
element_50: 'Tin',
element_51: 'Antimony',
element_52: 'Tellurium',
element_53: 'Iodine',
element_54: 'Xenon',
element_55: 'Cesium',
element_56: 'Barium',
element_57: 'Lanthanum',
element_58: 'Cerium',
element_59: 'Praseodymium',
element_60: 'Neodymium',
element_61: 'Promethium',
element_62: 'Samarium',
element_63: 'Europium',
element_64: 'Gadolinium',
element_65: 'Terbium',
element_66: 'Dysprosium',
element_67: 'Holmium',
element_68: 'Erbium',
element_69: 'Thulium',
element_70: 'Ytterbium',
element_71: 'Lutetium',
element_72: 'Hafnium',
element_73: 'Tantalum',
element_74: 'Tungsten',
element_75: 'Rhenium',
element_76: 'Osmium',
element_77: 'Iridium',
element_78: 'Platinum',
element_79: 'Gold',
element_80: 'Mercury',
element_81: 'Thallium',
element_82: 'Lead',
element_83: 'Bismuth',
element_84: 'Polonium',
element_85: 'Astatine',
element_86: 'Radon',
element_87: 'Francium',
element_88: 'Radium',
element_89: 'Actinium',
element_90: 'Thorium',
element_91: 'Protactinium',
element_92: 'Uranium',
element_93: 'Neptunium',
element_94: 'Plutonium',
element_95: 'Americium',
element_96: 'Curium',
element_97: 'Berkelium',
element_98: 'Californium',
element_99: 'Einsteinium',
element_100: 'Fermium',
element_101: 'Mendelevium',
element_102: 'Nobelium',
element_103: 'Lawrencium',
element_104: 'Rutherfordium',
element_105: 'Dubnium',
element_106: 'Seaborgium',
element_107: 'Bohrium',
element_108: 'Hassium',
element_109: 'Meitnerium',
element_110: 'Darmstadtium',
element_111: 'Roentgenium',
element_112: 'Copernicium',
element_113: 'Nihonium',
element_114: 'Flerovium',
element_115: 'Moscovium',
element_116: 'Livermorium',
element_117: 'Tennessine',
element_118: 'Oganesson',
seagrass: 'Seagrass',
coral: 'Coral',
coral_block: 'Coral Block',
coral_fan: 'Coral Fan',
coral_fan_dead: 'Dead Coral Fan',
coral_fan_hang: 'Coral Fan',
coral_fan_hang2: 'Coral Fan',
coral_fan_hang3: 'Coral Fan',
kelp: 'Kelp',
dried_kelp_block: 'Dried Kelp Block',
acacia_button: 'Acacia Button',
birch_button: 'Birch Button',
dark_oak_button: 'Dark Oak Button',
jungle_button: 'Jungle Button',
spruce_button: 'Spruce Button',
acacia_trapdoor: 'Acacia Trapdoor',
scaffolding: 'Scaffolding'
}

export default db;

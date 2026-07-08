-- Update stones to mark them as featured based on your CSV data
UPDATE "Product" SET "isFeatured" = true, "isBestSeller" = true WHERE id IN (
  'cmr3lteeq0009wbuvcfbkawzc',  -- amethyst
  'cmr3ltfaq000hwbuvu4uvrnel',  -- rose-quartz
  'cmr3ltg84000nwbuvat3bb3no',  -- labradorite
  'cmr3lthvy0010wbuvyt3zzgnk',  -- chakra-cleanse-candle
  'cmr3ltmxy001xwbuvm5c8lgeu',  -- yoga-set
  'cmr3ltom10027wbuvqagb2a9b',  -- crystal-pendulum
  'cmr3ltqcp002iwbuvjg084lxt',  -- smudge-bundle
  'cmr3ltlco001nwbuvitmixrn5',  -- meditation-robe
  'cmr3ltjv0001dwbuvmwtdu525'   -- red-energy-dress
);

-- Update specific stones as featured only (not bestseller)
UPDATE "Product" SET "isFeatured" = true WHERE id IN (
  'cmr3lth20000twbuvai8jf6cp',  -- moon-ritual-candle
  'cmr3ltj060017wbuv6f4hnptb',  -- protection-candle
  'cmr3ltpfd002cwbuv9hdwqnsj',  -- mala-beads
  'cmr3ltqcp002iwbuvjg084lxt'   -- smudge-bundle
);

-- Update specific stones as bestseller only (not featured)
UPDATE "Product" SET "isBestSeller" = true WHERE id IN (
  'cmr3ltj060017wbuv6f4hnptb',  -- protection-candle
  'cmr3ltpfd002cwbuv9hdwqnsj'   -- mala-beads
);

-- Verify the updates
SELECT id, "nameEN", "nameFA", type, "isFeatured", "isBestSeller" 
FROM "Product" 
WHERE type = 'stones' AND ("isFeatured" = true OR "isBestSeller" = true)
ORDER BY "createdAt" DESC;

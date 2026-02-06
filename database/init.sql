CREATE TYPE season_type AS ENUM ('spring', 'summer', 'autumn', 'winter');
CREATE TYPE color_type AS ENUM (
  'black',
  'white',
  'gray',
  'blue',
  'red',
  'green',
  'yellow',
  'brown',
  'beige',
  'pink',
  'purple',
  'orange'
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TABLE item_categories (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE,
  name VARCHAR(25),
  CONSTRAINT unique_category_name UNIQUE (user_id, name)
);

CREATE TABLE items (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  category_id INTEGER REFERENCES item_categories(id) ON DELETE SET NULL,
  seasons season_type[] NOT NULL,
  primary_color color_type NOT NULL,
  secondary_colors color_type[],
  brand VARCHAR(50) NOT NULL,
  image_keys text[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_item_name UNIQUE (user_id, name)
);

CREATE TABLE tags (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE,
  name VARCHAR(25) NOT NULL,
  CONSTRAINT unique_tag_name UNIQUE (user_id, name)
);

CREATE TABLE item_tags (
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,

  PRIMARY KEY (tag_id, item_id)
);

CREATE TABLE outfits (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  note VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE outfit_items (
  outfit_id INTEGER REFERENCES outfits(id) ON DELETE CASCADE,
  item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,

  PRIMARY KEY (outfit_id, item_id)
);


DROP TRIGGER IF EXISTS trg_set_updated_at_items ON items;
CREATE TRIGGER trg_set_updated_at_items
BEFORE UPDATE ON items
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_outfits ON outfits;
CREATE TRIGGER trg_set_updated_at_outfits
BEFORE UPDATE ON outfits
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

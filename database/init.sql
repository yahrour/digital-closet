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


CREATE TABLE garment_categories (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE,
  name VARCHAR(25),
  CONSTRAINT unique_category_name UNIQUE (user_id, name)
);

CREATE TABLE garments (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  category_id INTEGER REFERENCES garment_categories(id) ON DELETE CASCADE,
  season season_type[] NOT NULL,
  primary_color color_type NOT NULL,
  secondary_colors color_type[],
  brand VARCHAR(50),
  image_url VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_garment_name UNIQUE (user_id, name)
);

CREATE TABLE tags (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE,
  name VARCHAR(25) NOT NULL,
  CONSTRAINT unique_tag_name UNIQUE (user_id, name)
);

CREATE TABLE garment_tags (
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  garment_id INTEGER REFERENCES garments(id) ON DELETE CASCADE,

  PRIMARY KEY (tag_id, garment_id)
);

CREATE TABLE outfits (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  note VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE outfit_garments (
  outfit_id INTEGER REFERENCES outfits(id) ON DELETE CASCADE,
  garment_id INTEGER REFERENCES garments(id) ON DELETE CASCADE,

  PRIMARY KEY (outfit_id, garment_id)
);


DROP TRIGGER IF EXISTS trg_set_updated_at_garments ON garments;
CREATE TRIGGER trg_set_updated_at_garments
BEFORE UPDATE ON garments
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_outfits ON outfits;
CREATE TRIGGER trg_set_updated_at_outfits
BEFORE UPDATE ON outfits
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

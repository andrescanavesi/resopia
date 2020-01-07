-- DDL generated by Postico 1.4.3
-- Not all database features are supported. Do not use for backup.

-- Table Definition ----------------------------------------------

CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    title character varying(120) NOT NULL,
    title_seo character varying(100) NOT NULL,
    description character varying(500) NOT NULL,
    ingredients character varying(1000) NOT NULL,
    active boolean NOT NULL DEFAULT false,
    prep_time_seo character varying(20) NOT NULL,
    cook_time_seo character varying(20) NOT NULL,
    total_time_seo character varying(20) NOT NULL,
    prep_time character varying(20) NOT NULL,
    cook_time character varying(20) NOT NULL,
    total_time character varying(20) NOT NULL,
    cuisine character varying(40) NOT NULL,
    yield character varying(20) NOT NULL,
    facebook_shares integer NOT NULL,
    pinterest_pins integer NOT NULL,
    steps character varying(2000) NOT NULL,
    featured_image_name character varying(40) NOT NULL,
    secondary_image_name character varying(40),
    extra_ingredients_title character varying(40),
    extra_ingredients character varying(500),
    notes character varying(500),
    youtube_video_id character varying(60),
    tweets integer,
    aggregate_rating decimal
);

ALTER TABLE "public"."recipes" ADD COLUMN "aggregate_rating" decimal;
UPDATE recipes SET aggregate_rating=4.3 WHERE id>0 

-- Indices -------------------------------------------------------

CREATE UNIQUE INDEX recipes_pkey ON recipes(id int4_ops);

-- DDL generated by Postico 1.4.3
-- Not all database features are supported. Do not use for backup.

-- Table Definition ----------------------------------------------

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name text NOT NULL,
    image_name text NOT NULL,
    quantity_recipes integer NOT NULL,
    name_seo text NOT NULL,
    is_featured boolean NOT NULL
);

-- Indices -------------------------------------------------------

CREATE UNIQUE INDEX tags_pkey ON tags(id int4_ops);


-- DDL generated by Postico 1.4.3
-- Not all database features are supported. Do not use for backup.

-- Table Definition ----------------------------------------------

CREATE TABLE recipes_tags (
    id SERIAL PRIMARY KEY,
    recipe_id integer REFERENCES recipes(id) ON DELETE CASCADE ON UPDATE CASCADE,
    tag_id integer REFERENCES tags(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indices -------------------------------------------------------

CREATE UNIQUE INDEX recipes_tags_pkey ON recipes_tags(id int4_ops);

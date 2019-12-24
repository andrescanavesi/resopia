CREATE TABLE recipes
(
    id SERIAL PRIMARY KEY,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    title character varying(120) NOT NULL,
    title_seo character varying(100) NOT NULL,
    description character varying(500) NOT NULL,
    ingredients character varying(1000) NOT NULL,
    extra_ingredients_title character varying(100) NOT NULL,
    extra_ingredients character varying(1000) NOT NULL,
    active boolean NOT NULL DEFAULT false,
    prep_time_seo character varying(20),
    cook_time_seo character varying(20),
    total_time_seo character varying(20),
    prep_time character varying(20),
    cook_time character varying(20),
    total_time character varying(20),
    cuisine character varying(40),
    yield character varying(20)
);
CREATE UNIQUE INDEX recipes_pkey ON recipes(id int4_ops);
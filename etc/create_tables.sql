CREATE TABLE recipes
(
    id SERIAL PRIMARY KEY,
    title character varying(120) NOT NULL,
    title_for_url character varying(100) NOT NULL,
    description character varying(500) NOT NULL,
    ingredients character varying(1000) NOT NULL,
    steps character varying(2000) NOT NULL,
    keywords character varying(100),
    active boolean NOT NULL DEFAULT false,
    featured_image_name character varying(50) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    user_id integer REFERENCES users (id),
    category_name character varying(30),
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
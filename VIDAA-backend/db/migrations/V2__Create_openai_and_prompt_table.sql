create table openai_config (
    id integer not null primary key autoincrement,
    api_key varchar(255) not null,
    base_url varchar(255) not null,
    model_name varchar(255) not null,
    display_name varchar(255) not null,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp,
    is_valid boolean default true
);

create table prompt (
    id integer not null primary key autoincrement,
    prompt_name varchar(255) not null,
    category varchar(255) not null check (category in ('classification', 'generation')),
    prompt_text text not null,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp
);

create table ollama_config (
    id integer not null primary key autoincrement,
    model_name varchar(255) not null,
    base_url varchar(255) not null,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp,
    is_valid boolean default true
);

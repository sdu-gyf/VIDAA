create table pexels (
    id integer not null primary key autoincrement,
    query_word varchar(255) not null,
    urls text not null,
    page integer not null,
    per_page integer not null,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp
);

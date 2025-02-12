create table article (
    id integer not null primary key autoincrement,
    title varchar(255) not null,
    url varchar(255) not null,
    from_rss_name varchar(255) not null,
    content text not null,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp
);

create database password_manager;

create table if not exists `users`(
    id int(5) AUTO_INCREMENT PRIMARY KEY,
    name varchar(25) NOT NULL,
    email varchar(50) NOT NULL,
    pass varchar(256) NOT NULL,
    UNIQUE(email)
);

create table if not exists pass_table(
	id int AUTO_INCREMENT PRIMARY KEY,
    app_name varchar(50) NOT NULL,
    main_email varchar(50) NOT NULL,
    email varchar(50) NOT NULL,
    username varchar(50),
    pass varchar(256) not null,
    FOREIGN KEY (main_email) REFERENCES users(email)
    ON UPDATE CASCADE
	ON DELETE CASCADE
);

select * from users;

-- truncate users;
-- TRUNCATE pass_table;
-- drop table pass_table;
-- drop table users;

select * from pass_table;

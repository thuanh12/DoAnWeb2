    drop table tickets;
    drop table bookings;
    drop table showtimes;
    drop table uzers;
    drop table cinemarooms;
    drop table cinemas;
    drop table movies;

create table if not exists movies(
	id serial primary key not null,
    name varchar(100),
    openningDay date,
    imagePoster varchar(100),
    type varchar(100),
    duration int
);

create table if not exists cinemas(
	id serial primary key not null,
    name varchar(100),
    address varchar(200)
);

create table if not exists cinemarooms(
    id serial primary key not null,
    name varchar(255),
    type varchar(255),
    verticalSize int,
    horizontalSize int,
    cinema_id int REFERENCES cinemas("id") ON DELETE SET NULL ON UPDATE CASCADE
);

create table if not exists Uzers(
	id serial primary key not null,
    email varchar(200),
    password varchar(100),
    fullname varchar(100),
    telephone varchar(12),
    rule varchar(45)
);

create table if not exists showtimes(
	id serial primary key not null,
    timeStart timestamp,
    timeFinish timestamp,
    ticketPrice float,
    amount int,
    movie_id int REFERENCES movies ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    cinemaroom_Id int REFERENCES cinemarooms ("id") ON DELETE SET NULL ON UPDATE CASCADE
);



create table if not exists bookings(
	id serial primary key not null,
    timeOfBooking timestamp,
    price float,
    verticalAddress varchar(45),
    horizontalAddress varchar(45),
    showtime_id int REFERENCES showtimes ("id") ON DELETE SET NULL ON UPDATE CASCADE,
	uzer_id int REFERENCES uzers ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

create table if not exists tickets(
	id serial primary key not null,
    seatCode varchar(45),
    horizontalAddress varchar(45),
    verticalAddress varchar(45),
    price float,
    booking_id int REFERENCES bookings ("id") ON DELETE SET NULL ON UPDATE CASCADE
);


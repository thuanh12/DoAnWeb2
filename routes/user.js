var express = require("express");
var router = express.Router();
const Movie = require("../DB/model/Movie");
const User = require("../DB/model/User");
const Booking = require("../DB/model/Booking");
const ShowTime = require("../DB/model/ShowTime");
const Cinema = require("../DB/model/Cinema");
const CinemaRoom = require("../DB/model/CinemaRoom");
const Op = require('sequelize').Op;
const Pg = require("../DB/Postgres");
const Promise = require('bluebird');
/* GET home page. */
router.get('/', async function(req, res, next) {
  var result = {};
  var isMovieOnScreenSeeAll = false;
  var isMovieComingSoonSeeAll = false;

  if (req.query.isMovieOnScreenSeeAll === "less" || !req.query.isMovieOnScreenSeeAll) {
    var movieOnScreen = await Movie.findAll({
      limit:12,
      where: {
        openningday: {
          [Op.lte]: new Date()
        }
      }
    });
    result.movieOnScreen = movieOnScreen.map((item) => item.dataValues);
  } else {
    var movieOnScreen = await Movie.findAll();
    result.movieOnScreen = movieOnScreen.map((item) => item.dataValues);
    isMovieOnScreenSeeAll = true;
  }

  if (req.query.isMovieComingSoonSeeAll === "less" || !req.query.isMovieComingSoonSeeAll) {
    var movieComingSoon = await Movie.findAll({
      limit:12,
      where: {
        openningday: {
          [Op.gt]: new Date()
        }
      }
    });
    result.movieComingSoon = movieComingSoon.map((item) => item.dataValues);
  } else {
    var movieComingSoon = await Movie.findAll();
    result.movieComingSoon = movieComingSoon.map((item) => item.dataValues);
    isMovieComingSoonSeeAll = true;
  }
  var user = null;
  if (req.session.user) {
    user = req.session.user;
  }
  res.render("index", {
    result: result,
    isMovieOnScreenSeeAll: isMovieOnScreenSeeAll,
    isMovieComingSoonSeeAll: isMovieComingSoonSeeAll,
    user: user
  });
});
router.get("/movieWatchedMost", async function(req, res, next){
  var movieIdList = await ShowTime.findAll({
    attributes: ['movie_id', [Pg.Sequelize.fn('count',Pg.Sequelize.col("showtimes.movie_id")), 'amount']],
    raw: true,
    include: [{model: Booking, attributes:[]}],
    group: ['showtimes.movie_id']
  });
  var Ids = movieIdList.map(item => item.movie_id)

  var movies = await Movie.findAll({
    where: {
      id: {
        [Op.in]: Ids
      }
    }
  });
  movieIdList.sort((a, b) => (a.count < b.count) ? 1 : -1);
  var moviesOrdered = movieIdList.map(item => movies.filter(movie => movie.id == item.movie_id));
  res.send(moviesOrdered);
});

router.post("/editUser", async function(req, res, next) {
  var userId = req.body.id
  if (!userId) {
    throw new Error("UserId not found.");
  }

  var userModel = await User.findOne({
    where: {
      id: userId
    }
  });

  if (!userModel) {
    throw new Error("User not found");
  }

  var user = {
    email : req.body.email,
    password: req.body.password,
    fullname: req.body.fullname,
    telephone: req.body.telephone
  }
  var updatedUser = await User.update(user, {
    where: {
      id: userModel.id
    }
  })
  if (!updatedUser[0]) {
    throw new Error("Updating failed.")
  }
  user.id = userId;
  user.rule = userModel.rule;
  res.render("user", {user: user});
});

router.get("/showtime", async function(req, res, next) {
  var nameCinema = req.query.nameCinema;
  var nameMovie = req.query.nameMovie;
  if (nameCinema && nameMovie) {
    res.send(await getShowtimeByNameMovieAndNameCinema(nameCinema, nameMovie));
    return;
  }
  if (nameCinema) {
    res.send(await getShowTimeByNameCinema(nameCinema));
  }
  return null;
});

router.get("/bookingTicket", async function(req, res, next){
  var user = null;
  if (req.session.user) {
    user = req.session.user;
  }
  if (!user) {
    res.cookie("previousUrl", req.originalUrl);
    res.redirect("/login");
    return;
  } else {
    if (req.cookies.previousUrl) {
      res.clearCookie("previousUrl");
    }
  }
  var userId = user.id;
  var stId = req.query.showtimeId;
  var st = await ShowTime.findOne({
    where: {
      id : stId
    }
  });
  await Pg.sequelize.transaction(async (t) => {
    var showtime = await ShowTime.findOne({
      where: {
        id : stId
      },
      include:[
        {
          model: CinemaRoom
        }
      ]
    });
    movieId = showtime.movieId;
    if (showtime.amount > 0) {
      var booking = {
        timeofbooking: new Date(),
        price: showtime.ticketprice,
        user_id: userId,
        showtime_id: showtime.id
      };
      await Booking.create(booking).catch(error => {
        console.log(error);
      });
      showtime.amount = showtime.amount - 1;
      await showtime.save({
        transaction: t
      });
    }
    // Doi 10 giay
    await Promise.delay(10000);
  });
  res.redirect("/ticketBooking?id=" + movieId);
});

async function getShowtimeByNameMovieAndNameCinema(nameCinema, nameMovie) {
  var cinema = await Cinema.findAll({
    where: {
      name: nameCinema
    }
  });
  var movie = await Movie.findAll({
    where: {
      name: nameMovie
    }
  });
  if (!cinema || !movie) {
    return null;
  }
  var cinemaId = cinema[0].id;
  var movieId = movie[0].id;

  var showtimes = await ShowTime.findAll({
    where: {
      cinema_id: cinemaId,
      movie_id: movieId
    }
  });
  return showtimes;
}

async function getShowTimeByNameCinema(nameCinema) {
  var cinema = await Cinema.findAll({
    where: {  
      name: nameCinema
    }
  });
  if (!cinema) {
    return null;
  } 
  var cinemaId = cinema[0].id;
  var showtimes = await ShowTime.findAll({
    where: {
      cinema_id: cinemaId,
    }
  });
  return showtimes;
}

router.get("/login", function(req, res, next){
  if (req.originalUrl == "/login") {
    if (req.originalUrl.previousUrl) {
      res.clearCookie("previousUrl");
    }
  }
  res.render("login.ejs", {user: null, login: "true"});
});

router.post("/handleLogin", async function(req, res, next){
  var email = req.body.email;
  var password = req.body.password;
  var user = await User.findOne({
    where: {
      email: email,
      password: password
    }
  });
  if (!user) {
    res.render("login", {user: null, login: "false"});
    return;
  }
  req.session.user = user;
  if (req.cookies.previousUrl) {
    res.redirect(req.cookies.previousUrl);
    return;
  }
  res.redirect("/");
});

router.get("/register", function(req, res, next){
  res.render("register.ejs", {register: "true", user: null});
});
router.post("/handleRegister", async function(req, res, next) {
  var email = req.body.email;
  var password = req.body.password;
  var fullname = req.body.fullname;
  var telephone = req.body.telephone;
  var user = await User.findOne({
    where: {
      email: email,
      password: password
  }})
  if (user) {
    res.render("register", {register: "false", user: null});
    return;
  }
  User.create({
      email: email,
      password: password,
      fullname: fullname,
      telephone: telephone,
      rule: "user"
    });
    res.redirect("/login");    
});

router.get("/user", async function(req, res){
  var userId = req.query.id;
  var user = await User.findOne({
    where: {
      id: userId
    }
  });
  if (!user) {
    throw Error("User not found");
  }
  res.render("user", {user:user})
});

router.get("/boolkingTicketList", async function(req, res){
  var userId = req.query.id;
  var user = await User.findOne({
    where: {
      id: userId
    }
  });
  if (!user) {
    throw Error("User not found");
  }
  res.render("bookingticketlistbase",{user:user});
});

router.get("/api/bookingTicketList", async function(req, res, next){
  var userId = req.query.id;
  var user = await User.findOne({
    where: {
      id: userId
    }
  });
  if (!user) {
    throw Error("User not found");
  }
  var bookings = await Booking.findAll({
    where: {
      uzer_id: userId,
    },
    include: [
      {
        model: ShowTime,
        include: [
          {
            model:CinemaRoom,
            include: [
              {
                model: Cinema
              }
            ]
          }, 
          {
            model: Movie
          }
        ]
      }
    ]
  });
  res.send(bookings);
});


router.get("/home_submit", async function(req, res) {
  var searchField = req.query.searchField;
  var movies = await Movie.findAll({
    where: {
      [Op.or]: [
        {name:{[Op.substring]: searchField}}
        , {type: {[Op.substring]: searchField}}
      ]
    }
  })
  var user = null;
  if (req.session.user) {
    user = req.session.user;
  }
  res.render("searchPage", {user:user, result:movies, name: searchField});
});

router.get("/movieListByCinema", async function(req, res){
  var id = req.query.id;

  var cinema = await Cinema.findOne({
    where: {
      id: id
    },
    include: [
      {
        model: CinemaRoom
      }
    ]
  });
  var cinemarRoomIdList = cinema.cinemarooms.map((item) => item.id);

  if (!cinema) {
    throw new Error("Cinema not found.");
  }
  var showtime = await ShowTime.findAll({
    include: [
      {model: Movie},
      {
        model: CinemaRoom,
        where: {
          id: {[Op.in] : cinemarRoomIdList}
        }
      }
    ]
  });
  var movies = showtime.map((item) => item.movie.dataValues);
  var user = null;
  if (req.session.user) {
    user = req.session.user;
  }
  res.render("searchPage", {user:user, result:movies, name: cinema.name + " Cinema"});
});

router.get("/movieListByCinemaRoom", async function(req, res){
  var id = req.query.id;

  var cinemaRoom = await CinemaRoom.findOne({
    where: {
      id: id
    },
    include: [
      {
        model:Cinema,
      },
      {
        model:ShowTime,
        include: [
          {model: Movie}
        ]
      }
    ]
  })
  if (!cinemaRoom) {
    throw new Error("CinemaRoom not found.");
  }
  var movies = cinemaRoom.showtimes.map((item) => item.movie);
  var user = null;
  if (req.session.user) {
    user = req.session.user;
  }
  res.render("searchPage", {user:user, result:movies, name: cinemaRoom.name + " CinemaRoom"});
});



router.get("/cinema", async function(req, res) {
  var user = null;
  if (req.session.user) {
    user = req.session.user;
  }
  var cinemas = await Cinema.findAll({
    include: [
      {
        model: CinemaRoom
      }
    ]
  })
  var result = await cinemas.map(function(item) {
    var cinema = item.dataValues;
    var cinemaRooms = cinema.cinemarooms.map((item1) => item1.dataValues);
    cinema.cinemarooms = cinemaRooms;
    return cinema;
  });
  res.render("cinema",{user:user, result:result})
});


router.get("/detailFilm", async function(req, res){
  var user = null;
  if (req.session.user) {
    user = req.session.user;
  }
  var id = req.query.id;
  var movie = await Movie.findOne({
    where: {
      id: id
    }
  });
  if (!movie) {
    throw new Error("Movie not found.")
  }
  res.render("detailFilm", {user:user, result: movie});
});

router.get("/ticketBooking", async function(req, res) {
  var user = null;
  if (req.session.user) {
    user = req.session.user;
  }
  var movieId = req.query.id;
  var movie = await Movie.findOne({
    where: {
      id: movieId
    }
  });
  if (!movie) {
    throw new Error("Movie not found");
  }
  var cinenaRooms = await CinemaRoom.findAll({
    include: [
      {
        model: ShowTime,
        where: {
          movie_id: movieId
        }
      },
      {
        model:Cinema
      }
    ]
  }).catch(err => {
    console.log(err);
  });

  res.render("ticketBooking", {user: user, movie: movie.dataValues, cinemarooms: cinenaRooms});
});

// admin
router.get("/admincinema", function(req, res, next){
  var user = null;
  if (req.session.user) {
    user = req.session.user;
  }
  res.render("admin-cinema", {user: user});
});

router.get("/api/cinemas", async function(req, res){
  var cinemas = await Cinema.findAll();
  res.send(cinemas);
});

router.get("/cinema/delete", async function(req, res, next) {
  var id = req.query.id;
  var user = req.session.user; 
  if (!user) {
    next();
  }
  await Cinema.destroy({
    where: {
      id: id
    }
  })
  res.redirect("/admincinema?id=" + user.id);
});

router.post("/cinema", async function(req, res, next){
  var user = req.session.user;
  if (!user) {
    next();
  }
  var name = req.body.name;
  var address = req.body.address;
  var cinema = {
    name: name,
    address: address
  }
  await Cinema.create(cinema);
  res.redirect("/admincinema?id=" + user.id);
});


// cineme Room
router.get("/admincinemaroom", async function(req, res, next) {
  var user = req.session.user;
  if (!user) {
    next();
  }
  res.render("admin-cinemaRoom", {user:user});

});

router.get("/api/cinemaRoom", async function(req, res){
  var cinemaRooms = await CinemaRoom.findAll({
    include: [
      {
        model: Cinema
      }
    ]
  });
  res.send(cinemaRooms);
});

router.get("/cinemaroom/delete", async function(req, res){
  var id = req.query.id;
  await CinemaRoom.destroy({
    where: {
      id : id
    }
  });
  res.redirect("/admincinemaroom")
});

router.post("/cinemaroom", async function(req, res){
  var cinema = await Cinema.findOne({
    where: {
      name: req.body.cinemaName
    }
  })
  var cinemarroom = {
    cinema: cinema,
    type: req.body.type,
    name: req.body.name
  }
  CinemaRoom.create(cinemarroom, {
    include: [{
      association: Cinema
    }]
  })
  res.redirect("/admincinemaroom")
});

module.exports = router;

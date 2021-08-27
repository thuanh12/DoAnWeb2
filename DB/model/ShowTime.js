const Pg = require("../Postgres");
const Sequelize = Pg.Sequelize;
const sequelize = Pg.sequelize;
const Movie = require("../model/Movie");
const CinemaRoom = require("../model/CinemaRoom");
class ShowTime extends Sequelize.Model {}
ShowTime.init({
  // attributes
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement:true},
  timestart: Sequelize.DataTypes.DATEONLY,
  timefinish: Sequelize.DataTypes.DATEONLY,
  amount: Sequelize.INTEGER,
  ticketprice: Sequelize.FLOAT
}, {
  sequelize,
  modelName: 'showtimes',
  underscored: true,
  // options
});
ShowTime.belongsTo(Movie);
Movie.hasMany(ShowTime);

ShowTime.belongsTo(CinemaRoom);
CinemaRoom.hasMany(ShowTime);
module.exports = ShowTime;

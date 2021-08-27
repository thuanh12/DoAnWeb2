const Pg = require("../Postgres");
const Sequelize = Pg.Sequelize;
const sequelize = Pg.sequelize;
const Cinema = require("./Cinema");
class CinemaRoom extends Sequelize.Model {}
CinemaRoom.init({
  // attributes
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement:true},
  name: Sequelize.STRING,
  type: Sequelize.STRING,
  verticalsize: Sequelize.INTEGER,
  horizontalsize: Sequelize.INTEGER
}, {
  sequelize,
  modelName: 'cinemarooms',
  underscored: true,
  // options
});

CinemaRoom.belongsTo(Cinema);
Cinema.hasMany(CinemaRoom);
module.exports = CinemaRoom;

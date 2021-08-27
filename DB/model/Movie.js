const Pg = require("../Postgres");
const Sequelize = Pg.Sequelize;
const sequelize = Pg.sequelize;
class Movie extends Sequelize.Model {}
Movie.init({
  // attributes
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement:true},
  name: Sequelize.STRING,
  openningday: Sequelize.DATEONLY,
  imageposter: Sequelize.STRING,
  duration: Sequelize.INTEGER,
  type: Sequelize.STRING
}, {
  sequelize,
  modelName: 'movies',
  underscored: true,
  // options
});
module.exports = Movie;

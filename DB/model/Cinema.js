const Pg = require("../Postgres");
const Sequelize = Pg.Sequelize;
const sequelize = Pg.sequelize;
class Cinema extends Sequelize.Model {}
Cinema.init({
  // attributes
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement:true},
  name: Sequelize.STRING,
  address: Sequelize.STRING,
}, {
  sequelize,
  modelName: 'cinemas',
  underscored: true,
  // options
});

module.exports = Cinema;

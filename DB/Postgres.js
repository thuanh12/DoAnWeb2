const Sequelize = require('sequelize');
const env = process.env.DATABASE_URL;
const sequelize = new Sequelize(env || 'postgres://postgres:daubanh12@localhost:5432/web', {
  define: {
    timestamps: false
  }
});
exports.Sequelize = Sequelize;
exports.sequelize = sequelize;
const { sequelize } = require('./models');

// Connects to a REAL, persistent PostgreSQL database using DATABASE_URL from .env.
const connectDB = async () => {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set in .env. Add your PostgreSQL connection string.');
    }

    await sequelize.authenticate();
    console.log('Database connected successfully!');

    // Creates tables from the models if they don't exist yet, and adds any new
    // columns/indexes on top of existing tables. Fine for an assessment/dev
    // project; a real production app would use sequelize-cli migrations instead
    // so schema changes are tracked and reversible.
    await sequelize.sync({ alter: true });
    console.log('Database synced.');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

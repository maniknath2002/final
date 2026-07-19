const { Sequelize } = require('sequelize');

// Connects to a REAL, persistent PostgreSQL database using DATABASE_URL from .env.
// Works with any standard Postgres host (Render, Railway, Neon, Supabase, RDS, etc).
if (!process.env.DATABASE_URL) {
  // Thrown lazily by db.js's connectDB() too, but Sequelize needs a string up front
  // to construct the instance, so we guard here as well.
  console.warn('Warning: DATABASE_URL is not set yet. Set it in .env before starting the server.');
}

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://placeholder', {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    // Most managed Postgres providers (Render, Railway, Neon, Supabase) require SSL
    // but use self-signed certs, so we disable strict verification.
    ssl: process.env.DB_SSL === 'false' ? false : { require: true, rejectUnauthorized: false },
  },
});

const User = require('./User')(sequelize);
const Job = require('./Job')(sequelize);
const Application = require('./Application')(sequelize);
const SavedJob = require('./SavedJob')(sequelize);

// ----- Associations (the relational equivalent of Mongoose's `ref`) -----

// A User (Employer) posts many Jobs
User.hasMany(Job, { foreignKey: 'postedBy', as: 'jobs' });
Job.belongsTo(User, { foreignKey: 'postedBy', as: 'employer' });

// A Job has many Applications; an Application belongs to one Job
Job.hasMany(Application, { foreignKey: 'jobId', as: 'applications', onDelete: 'CASCADE' });
Application.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

// A User (Candidate) has many Applications
User.hasMany(Application, { foreignKey: 'candidateId', as: 'applications', onDelete: 'CASCADE' });
Application.belongsTo(User, { foreignKey: 'candidateId', as: 'candidate' });

// A Job can be saved by many Users; a User can save many Jobs
Job.hasMany(SavedJob, { foreignKey: 'jobId', as: 'savedBy', onDelete: 'CASCADE' });
SavedJob.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

User.hasMany(SavedJob, { foreignKey: 'candidateId', as: 'savedJobs', onDelete: 'CASCADE' });
SavedJob.belongsTo(User, { foreignKey: 'candidateId', as: 'candidate' });

module.exports = { sequelize, User, Job, Application, SavedJob };

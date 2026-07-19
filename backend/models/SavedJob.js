const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class SavedJob extends Model {}

  SavedJob.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      jobId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'jobs', key: 'id' },
      },
      candidateId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
      },
    },
    {
      sequelize,
      modelName: 'SavedJob',
      tableName: 'saved_jobs',
      timestamps: true,
      indexes: [
        // A candidate can only save a given job once (same rule as the old
        // Mongoose compound unique index).
        { unique: true, fields: ['jobId', 'candidateId'] },
      ],
    }
  );

  SavedJob.prototype.toJSON = function () {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
  };

  return SavedJob;
};

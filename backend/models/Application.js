const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Application extends Model {}

  Application.init(
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
      status: {
        type: DataTypes.ENUM('Applied', 'Reviewing', 'Accepted', 'Rejected'),
        defaultValue: 'Applied',
      },
      appliedDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      modelName: 'Application',
      tableName: 'applications',
      timestamps: true,
      indexes: [
        // One application per candidate per job — DB-level backstop for the
        // duplicate check already done in the controller.
        { unique: true, fields: ['jobId', 'candidateId'] },
      ],
    }
  );

  Application.prototype.toJSON = function () {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
  };

  return Application;
};

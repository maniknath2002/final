const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Job extends Model {}

  Job.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: { type: DataTypes.STRING, allowNull: false },
      company: { type: DataTypes.STRING, allowNull: false },
      location: { type: DataTypes.STRING, allowNull: false },
      workMode: {
        type: DataTypes.ENUM('Onsite', 'Remote', 'Hybrid'),
        allowNull: false,
      },
      employmentType: {
        type: DataTypes.ENUM('Full-time', 'Part-time', 'Contract', 'Internship'),
        allowNull: false,
      },
      salary: { type: DataTypes.STRING, allowNull: true }, // scraped sources often don't publish salary
      experience: { type: DataTypes.STRING, allowNull: true },
      // Postgres has a native array type, so this stays a simple array column —
      // no join table needed (that would only be worth it if skills needed their
      // own metadata or cross-job querying beyond simple filtering).
      skills: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
      description: { type: DataTypes.TEXT, allowNull: false },
      benefits: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
      deadline: { type: DataTypes.DATE, allowNull: true }, // scraped jobs rarely have a stated deadline
      postedBy: {
        type: DataTypes.INTEGER,
        allowNull: true, // kept optional so scraper jobs don't need an employer account
        references: { model: 'users', key: 'id' },
      },
      source: { type: DataTypes.STRING, defaultValue: 'Manual' }, // 'Manual' vs scraper source name
      sourceUrl: { type: DataTypes.STRING, allowNull: true, unique: true }, // used for scraper dedup
      status: {
        type: DataTypes.ENUM('Open', 'Closed'),
        defaultValue: 'Open',
      },
    },
    {
      sequelize,
      modelName: 'Job',
      tableName: 'jobs',
      timestamps: true,
      indexes: [
        { fields: ['status'] },
        { fields: ['location'] },
        { fields: ['postedBy'] },
      ],
    }
  );

  Job.prototype.toJSON = function () {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
  };

  return Job;
};

const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class User extends Model {}

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: { type: DataTypes.STRING, allowNull: false },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
        set(value) {
          // Mirrors the old Mongoose { lowercase: true, trim: true }
          this.setDataValue('email', String(value).trim().toLowerCase());
        },
      },
      password: { type: DataTypes.STRING, allowNull: false },
      role: {
        type: DataTypes.ENUM('Candidate', 'Employer', 'Admin'),
        defaultValue: 'Candidate',
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true, // adds createdAt / updatedAt, same as Mongoose's { timestamps: true }
    }
  );

  // Keep API responses shaped the way the existing React frontend expects
  // (it reads `_id` everywhere since it was built against MongoDB).
  User.prototype.toJSON = function () {
    const values = { ...this.get() };
    values._id = values.id;
    delete values.password; // never leak the hash, even if a query forgets to exclude it
    return values;
  };

  return User;
};

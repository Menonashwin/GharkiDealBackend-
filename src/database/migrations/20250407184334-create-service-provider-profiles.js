'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('service_provider_profiles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      service_provider_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'service_providers',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      zone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      rating: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      service_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      experience_years: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      id_proof_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      profile_image_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Add indexes
    await queryInterface.addIndex('service_provider_profiles', ['service_provider_id']);
    await queryInterface.addIndex('service_provider_profiles', ['service_type']);
    await queryInterface.addIndex('service_provider_profiles', ['zone']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('service_provider_profiles');
  },
};
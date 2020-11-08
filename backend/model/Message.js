const Sequelize = require('sequelize');
const db = require('../config/db');

const Message = db.define('message', {
        message_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        room_id: {
            type: Sequelize.STRING
        },
        message_text: {
            type: Sequelize.STRING
        },
        username: {
            type: Sequelize.STRING
        },
        message_timestamp: {
            type: 'TIMESTAMP',
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        message_type: {
            type: Sequelize.STRING
        }
    },
    {
        schema: 'miro_test',
        freezeTableName: true,
        timestamps: false,
        tableName: 'message'
    }
);

module.exports = Message;
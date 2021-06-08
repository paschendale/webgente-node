const Sequelize = require('sequelize');
const connection = require('../connection');

const Users = connection.define('User', {
    userName: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email:{
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    birthDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: new Date()
    },
    group: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'default'
    }    
})

/* Sincroniza o modelo com a base de dados, não substituindo tabelas existentes */
Users.sync({
    force: false,
    alter: true
}).then(() => {
    /* Insere usuário de administração do WebGENTE caso não exista outro usuário*/
    connection.query('SELECT COUNT() AS count FROM Users') // Verifica se existem dados na base do WebGENTE
    .then(results => {
        if (results[0][0].count == 0) {
            console.log('Inserindo usuário de administração padrão do WebGENTE')
            Users.bulkCreate([{
                userName: 'admin' ,
                password: '$2b$10$gQRnUm5mIPzDR9iPfqmgTe4QyBE1Ogi7p51FbbzCxX5xls/Sjo4FS', // Hash para 1234, senha padrão do admin
                email: 'gente@ufv.br',
                birthDate: new Date(),
                group: 'admin',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userName: 'noAdmin' ,
                password: '$2b$10$gQRnUm5mIPzDR9iPfqmgTe4QyBE1Ogi7p51FbbzCxX5xls/Sjo4FS', // Hash para 1234, senha padrão do admin
                email: 'ufv@ufv.br',
                birthDate: new Date(),
                group: 'users',
                createdAt: new Date(),
                updatedAt: new Date()
            }])
        }
    });
})

module.exports = Users;
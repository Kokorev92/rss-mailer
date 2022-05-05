var nodemailer = require('nodemailer');
let Parser = require('rss-parser');
const Sequelize = require('sequelize')

const smtp_settings = require('./settings.json');
const db_settings = require('./db_settings.json')

let parser = new Parser();

/// Создаём экземпляр для отправки писем
const transporter = nodemailer.createTransport({
    port: 465,
    host: smtp_settings.host,
    auth: {
        user: smtp_settings.user,
        pass: smtp_settings.pass,
    },
    secure: true,
});

/// Подключаемся к базе данных
const sequelize = new Sequelize(db_settings.name,
    db_settings.user,
    db_settings.pass,
    {
        dialect: "postgres", pool: {
            max: 10, min: 0, acquire: 30000,
            idle: 10000
        }
    });

/// Главная функция
(async () => {
    /// Получаем RSS сайта и формируем HTML-тело сообщения
    let feed = await parser.parseURL('https://dev-blog.ru/feed.xml')
    let html_post = "<body>"
    console.log(feed.title)
    console.log(feed)
    feed.items.forEach(item => {
        let item_str = `<a href="${item.link}">${item.title}</a> : ${item.content}<hr/>\n`
        html_post += item_str
        console.log(item_str)
    })

    html_post += "</body>"
    console.log(html_post)

    /// Модель данных таблицы в БД
    const email = sequelize.define("email_list", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        address: {
            type: Sequelize.STRING
        }
    }, {
        freezeTableName: true,
        timestamps: false
    })

    /// Получем список всех адресов из таблицы
    const emails = await email.findAll()
    sequelize.close()

    /// Проходимся по списку адресов и отправляем письма
    emails.forEach(elem => {
        transporter.sendMail({
            from: '"dev-blog.ru" <news@dev-blog.ru>',
            to: elem.address,
            subject: "Новые публикации",
            html: html_post
        }, (err, info) => {
            if (err) {
                console.log(err)
            } else {
                console.log(info)
            }
        })
    })
})(); 
var nodemailer = require('nodemailer');
const smtp_settings = require('./settings.json');
let Parser = require('rss-parser');

let parser = new Parser();

const transporter = nodemailer.createTransport({
    port: 465,
    host: "smtp.beget.ru",
    auth: {
        user: smtp_settings.user,
        pass: smtp_settings.pass,
    },
    secure: true,
});

(async () => {
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

    let result = transporter.sendMail({
        from: '"dev-blog.ru" <news@dev-blog.ru>',
        to: 'kyr2@yandex.ru',
        subject: "Новые публикации",
        html: html_post
    }, (err, info) => {
        if (err) {
            console.log(err)
        } else {
            console.log(info)
        }
    })

})();



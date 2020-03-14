const cheerio = require('cheerio');
const request = require('request');
const schedule = require('node-schedule');
const nodemailer = require('nodemailer');
const smtpPool = require('nodemailer-smtp-pool');

const url = 'http://www.welkeepsmall.com';
const MAX_SOLDOUT = 12;
const INTERVAL = 60000;

const ACCOUNT = 'rosieprintonly@gmail.com';
const PASSWORD = 'rlagywls90';

const RECEIVER = 'deejayreadme@gmail.com';

let scheduler = setInterval(() => {
    request(url, (error, response, html) => {
        if (error) {
            throw error;
        }
        let results = html.match(/SOLD OUT/g);
        if (isAvailableToBuy(results)) {
            console.log('Success, You can buy');
            sendMeMail(RECEIVER);
        } else {
            console.log('You can`t buy');
        }
    });
}, INTERVAL);

let checker = schedule.scheduleJob('00 * * * *', () => {
    sendMeMail(ACCOUNT);
});

function isAvailableToBuy(results) {
    if (results !== null && results.length < MAX_SOLDOUT) {
        return true;
    }
    return false;
}

function sendMeMail(receiver) {
    var smtpTransport = nodemailer.createTransport(
        smtpPool({
            service: 'Gmail',
            host: 'localhost',
            port: '465',
            tls: {
                rejectUnauthorize: false
            },
            auth: {
                user: ACCOUNT,
                pass: PASSWORD
            },
            maxConnections: 5,
            maxMessages: 10
        })
    );

    var mailOpt = {
        from: ACCOUNT,
        to: receiver,
        subject: 'Wellkeeps 마스크 입고 알림',
        html:
            '<a href="http://www.welkeepsmall.com/shop/shopbrandCA.html?type=X&xcode=023">http://www.welkeepsmall.com/shop/shopbrandCA.html?type=X&xcode=023</a>'
    };
    smtpTransport.sendMail(mailOpt, function(err, res) {
        if (err) {
            console.log(err);
        } else {
            console.log('Message send :' + res);
        }

        smtpTransport.close();
    });
}

const nodemailer = require('nodemailer');

const sendEmailCreateUser = (email, tokenVerifica) => {
    // Configura il trasportatore per l'invio delle email
    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: process.env.MAIL_ENCRYPTION === 'ssl', // Utilizza "true" se MAIL_ENCRYPTION="ssl"
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
        },
    });

    // URL per l'endpoint di verifica dell'email
    const verifyEmailUrl = `<a href="${process.env.BASE_URL}/verify?token=${tokenVerifica}">Verifica</a>`;

    const emailBody = `Salve,<br><br>
    Benvenuto nella famiglia di Cryptowallet Bankount! Siamo entusiasti di averti con noi.<br>
    Per completare l'attivazione del tuo account, ti preghiamo di fare clic sul link di seguito:<br>
    Attiva il tuo Account: ${verifyEmailUrl}<br>
    Se hai dubbi o domande, non esitare a contattarci. Grazie per aver scelto Cryptowallet Bankount!<br><br>
    Cordiali saluti,
    Il team di Cryptowallet Bankount`;
    

    // Opzioni per l'email
    const opzioniEmail = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: email,
        subject: "Benvenuto nel cryptowallet Bankount",
        html: emailBody,
    };

    // Invia l'email
    transporter.sendMail(opzioniEmail, (error, info) => {
        if (error) {
            console.error('Errore nell\'invio dell\'email:', error);
        } else {
            console.log('Email inviata correttamente:', info.response);
        }
    });
}


const sendEmailRecoverPassword = (email, tokenVerifica) => {

    // Configura il trasportatore per l'invio delle email
    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: process.env.MAIL_ENCRYPTION === 'ssl', // Utilizza "true" se MAIL_ENCRYPTION="ssl"
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
        },
    });

    console.log(process.env.BASE_URL)
    // URL per l'endpoint di verifica dell'email
    const verifyEmailUrl = `<a href="${process.env.BASE_URL}/verifyTokenChangePassword?token=${tokenVerifica}">Recupera Password</a>`;

    const emailBody = `Salve,<br><br>
    Ti inviamo questo messaggio perché hai richiesto il cambio password per il tuo account. Di seguito trovi il link che ti consentirà di procedere con il cambio password:<br>
    Cambia Password: ${verifyEmailUrl}<br>
    Se non hai richiesto questa azione, puoi ignorare questo messaggio.<br><br>    
    Grazie,
    Il team di Cryptowallet Bankount`;
    
    // Opzioni per l'email
    const opzioniEmail = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: email,
        subject: "Richiesta cambio Password",
        html: emailBody,
    };
    // Invia l'email
    transporter.sendMail(opzioniEmail, (error, info) => {
        if (error) {
            console.error('Errore nell\'invio dell\'email:', error);
        } else {
            console.log('Email inviata correttamente:', info.response);
        }
    });
}

module.exports = {
    sendEmailCreateUser,
    sendEmailRecoverPassword
}

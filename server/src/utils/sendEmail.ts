import nodemailer from "nodemailer";

export async function sendEmail(to: string, html: string) {
    // const testAccount = await nodemailer.createTestAccount()

    const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: "mp767w6uanzwsjby@ethereal.email",
            pass: "XyHPxyfhQ5BeFjZ9wC"
        },
    });

    const info = await transporter.sendMail({
        from: 'test@mail.com',
        to,
        subject: "Change password",
        html
    });
}

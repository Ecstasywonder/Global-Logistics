const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});

// Send tracking update notification
exports.sendTrackingUpdate = async (shipment, update) => {
    try {
        const message = {
            from: `"LogiTech Solutions" <${process.env.FROM_EMAIL}>`,
            to: shipment.user.email,
            subject: `Shipment Update - ${shipment.trackingNumber}`,
            html: `
                <h2>Shipment Update</h2>
                <p>Your shipment ${shipment.trackingNumber} has been updated:</p>
                <p><strong>Status:</strong> ${update.status}</p>
                <p><strong>Location:</strong> ${update.location.city}, ${update.location.country}</p>
                <p><strong>Description:</strong> ${update.description}</p>
                <p><strong>Time:</strong> ${update.timestamp}</p>
                <p>Track your shipment: <a href="${process.env.FRONTEND_URL}/tracking/${shipment.trackingNumber}">Click here</a></p>
            `
        };

        await transporter.sendMail(message);
    } catch (error) {
        console.error('Email sending failed:', error);
    }
};

// Send invoice notification
exports.sendInvoiceNotification = async (invoice) => {
    try {
        const message = {
            from: `"LogiTech Solutions" <${process.env.FROM_EMAIL}>`,
            to: invoice.user.email,
            subject: `Invoice ${invoice.invoiceNumber} - LogiTech Solutions`,
            html: `
                <h2>New Invoice</h2>
                <p>Invoice number: ${invoice.invoiceNumber}</p>
                <p>Amount due: $${invoice.total}</p>
                <p>Due date: ${new Date(invoice.dueDate).toLocaleDateString()}</p>
                <p>Please log in to your account to view and pay the invoice:</p>
                <p><a href="${process.env.FRONTEND_URL}/billing/invoices/${invoice._id}">View Invoice</a></p>
                <p>Thank you for choosing LogiTech Solutions!</p>
            `
        };

        await transporter.sendMail(message);
    } catch (error) {
        console.error('Invoice email sending failed:', error);
    }
}; 
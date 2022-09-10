import prisma from "./prisma";
import ejs from "ejs";
import htmlPdf from "html-pdf";
import { calculateTotalPrice, summarizeTicketAmount } from "../constants/util";
import { formatPrice } from "../constants/serverUtil";
import { PaymentType } from "../store/factories/payment/PaymentFactory";
import { getOption } from "./options";
import { Options } from "../constants/Constants";

export const generateInvoice = async (
    template,
    orderId: string
): Promise<Uint8Array> => {
    return new Promise<Uint8Array>(async (resolve, reject) => {
        const orderDB = await prisma.order.findUnique({
            where: {
                id: orderId
            },
            select: {
                user: true,
                event: true,
                locale: true,
                paymentType: true,
                paymentIntent: true,
                tickets: true
            }
        });

        const categories = await prisma.category.findMany();
        const totalPrice = calculateTotalPrice(orderDB.tickets, categories);

        let orders: Array<{ categoryId: number; amount: number }> = summarizeTicketAmount(orderDB.tickets, categories);

        let purpose = undefined;
        if (orderDB.paymentType === PaymentType.Invoice) {
            purpose = JSON.parse(orderDB.paymentIntent).invoicePurpose;
        }

        const date = new Date();
        const taxAmount = (await getOption(Options.TaxAmount));
        const html = ejs.render(template, {
            invoice_number: 1,
            creation_date: `${date.getDate()}. ${date.getMonth()} ${date.getFullYear()}`,
            receiver: [
                orderDB.user.firstName + " " + orderDB.user.lastName,
                orderDB.user.address,
                orderDB.user.zip + " " + orderDB.user.city
            ],
            products: orders.map((order) => {
                const category = categories.find(
                    (category) => category.id === order.categoryId
                );
                return {
                    name: category.label,
                    unit_price: formatPrice(
                        category.price,
                        category.currency,
                        orderDB.locale
                    ),
                    amount: order.amount,
                    total_price: formatPrice(
                        category.price * order.amount,
                        category.currency,
                        orderDB.locale
                    )
                };
            }),
            total_net_price: formatPrice(
                totalPrice * (1 - (taxAmount / 100)),
                categories[0].currency,
                orderDB.locale
            ),
            tax_amount: `${taxAmount}%`,
            total_price: formatPrice(
                totalPrice,
                categories[0].currency,
                orderDB.locale
            ),
            bank_information: (await getOption(Options.PaymentDetails)),
            ...(purpose && {purpose})
        });

        htmlPdf
            .create(html, { format: "A4" })
            .toBuffer((err, res) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(res);
            });
    });
};

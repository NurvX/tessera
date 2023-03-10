import { NextApiRequest, NextApiResponse } from "next";
import { OrderState } from "../../../../store/reducers/orderReducer";
import { PersonalInformationState } from "../../../../store/reducers/personalInformationReducer";
import { PaymentFactory, PaymentType } from "../../../../store/factories/payment/PaymentFactory";
import { generateSecret, validateOrder } from "../../../../constants/serverUtil";
import prisma from "../../../../lib/prisma";
import { ShippingFactory } from "../../../../store/factories/shipping/ShippingFactory";
import { v4 as uuid } from "uuid";

const createOrder = async (eventDateId, paymentType, user, locale) => {
    return await prisma.order.create({
        data: {
            eventDate: {
                connect: {
                    id: eventDateId
                }
            },
            paymentType: paymentType,
            user: {
                create: {
                    firstName: user.address.firstName,
                    lastName: user.address.lastName,
                    email: user.email,
                    address: user.address.address,
                    zip: user.address.zip,
                    city: user.address.city,
                    countryCode: user.address.country.countryShortCode,
                    regionCode: user.address.region.shortCode,
                    customFields: JSON.stringify(user.customFields)
                }
            },
            shipping: JSON.stringify(user.shipping),
            locale: locale,
            idempotencyKey: uuid(),
            cancellationSecret: generateSecret()
        },
        include: {
            user: true,
            tickets: true,
            task: true
        }
    });
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
        return;
    }

    const {
        order,
        user,
        eventDateId,
        paymentType,
        locale
    }: {
        order: OrderState;
        user: PersonalInformationState;
        eventDateId: number;
        paymentType: PaymentType;
        locale: string;
    } = req.body;
    try {
        // users may try to cheat their order using postman or some other interceptor, we need to check server side
        const [isValid] = await validateOrder(order.tickets, eventDateId, order.reservationId, false);
        if (!isValid)
            return res.status(411).end("Order not valid");

        const orderDB = await createOrder(eventDateId, paymentType, user, locale);
        await prisma.$transaction(order.tickets
            .map(ticket => ({...ticket, used: false, orderId: orderDB.id}))
            .map((ticket) => {
                return prisma.ticket.create({
                    data: ticket
                })
            })
        );

        if (orderDB.task === null &&
            (PaymentFactory.getPaymentInstance({type: paymentType, data: null}).needsManualProcessing() ||
                ShippingFactory.getShippingInstance({type: user.shipping.type, data: null}).needsManualProcessing()
            )) {
            await prisma.task.create({
                data: {
                    order: {
                        connect: {
                            id: orderDB.id
                        }
                    },
                    notes: "[]"
                }
            });
        }

        res.status(200).json({
            userId: orderDB.user.id,
            orderId: orderDB.id
        });
    } catch (e) {
        console.log(e);
        res.status(500).end("Server error");
    }
}

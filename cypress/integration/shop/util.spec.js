import { getStoreWithOrderId, storeOrderAndUser } from "../../../src/constants/util";
import faker from "@faker-js/faker";
import { ShippingType } from "../../../src/store/factories/shipping/ShippingFactory";
import countryData from "country-region-data";

describe("Util", () => {
    it("Store/Load Order", () => {
        cy.visit("/");
        cy.wrap(null).then(() => {
            const orderOriginal = {
                orders: [
                    {
                        categoryId: 1,
                        amount: 2
                    }
                ]
            };
            const country = countryData[0];
            const user = {
                email: faker.internet.email(),
                shipping: {
                    data: null,
                    type: ShippingType.Download
                },
                address: {
                    firstName: faker.name.firstName(),
                    lastName: faker.name.lastName(),
                    address: faker.address.streetAddress(),
                    city: faker.address.city(),
                    zip: faker.address.zipCode("#####"),
                    country: country,
                    region: country.regions.length > 0 ? country.regions[0] : null
                }
            };

            cy.storeOrderAndUser(orderOriginal, user, 1, "invoice").then(({userId, orderId}) => {
                expect(userId).to.not.equal(null).equal(undefined);
                expect(orderId).to.not.equal(null).equal(undefined);

                cy.getStoreWithOrderId(orderId).then(({personalInformation, order, eventId}) => {
                    expect(order).to.deep.equal(orderOriginal);
                    user.userId = userId;
                    expect(personalInformation).to.deep.equal(user);
                    expect(eventId).to.equal(1);

                    cy.storeOrderAndUser(order, personalInformation).then(secondStore => {
                        expect(secondStore.userId).to.equal(userId);
                    })
                })
            })
        })
    })
})

Cypress.Commands.add("storeOrderAndUser", async (orderOriginal, user, eventId, paymentType) => {
    return await storeOrderAndUser(
        orderOriginal,
        user,
        eventId,
        paymentType
    );
});

Cypress.Commands.add("getStoreWithOrderId", async (orderId) => {
    return await getStoreWithOrderId(orderId);
})

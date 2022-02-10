import { arrayEquals, calculateTotalPrice, totalTicketAmount } from "../../../src/constants/util";

describe("Utils", () => {
    it("Calculate Total Price", () => {
        const categories = [
            {
                id: 1,
                price: 60.99
            },
            {
                id: 2,
                price: 30.99
            }
        ];
        const seatsOrder = {
            seats: [
                {
                    category: 1,
                    amount: 1
                },
                {
                    category: 1,
                    amount: 2
                },
                {
                    category: 2,
                    amount: 2
                },
                {
                    category: 2,
                    amount: 1
                }
            ]
        };

        const price = categories[0].price * 3 + categories[1].price * 3
        expect(calculateTotalPrice(seatsOrder, categories)).to.equal(
            price
        );

        const freeSeatOrder = {
            orders: [
                {
                    categoryId: 1,
                    amount: 3
                },
                {
                    categoryId: 2,
                    amount: 3
                }
            ]
        };
        expect(calculateTotalPrice(freeSeatOrder, categories)).to.equal(
            price
        );
        expect(totalTicketAmount({})).to.equal(-1);
    })

    it("Total Ticket Amount", () => {
        const seatOrder = {
            seats: [
                {
                    amount: 2,
                },
                {
                    amount: 1,
                },
                {
                    amount: 1,
                },
                {
                    amount: 2,
                }
            ]
        };
        expect(totalTicketAmount(seatOrder)).to.equal(6);

        const freeSeatOrder = {
            orders: [
                {
                    amount: 2
                },
                {
                    amount: 1
                },
                {
                    amount: 1
                },
                {
                    amount: 2
                }
            ]
        };
        expect(totalTicketAmount(freeSeatOrder)).to.equal(6);

        expect(totalTicketAmount({})).to.equal(-1);
    })

    it("Array Equals", () => {
        expect(arrayEquals([1, 2], [1, 2])).to.equal(true);
        expect(arrayEquals([1, 2], [2, 1])).to.equal(true);
        expect(arrayEquals([1, 3], [2, 1])).to.equal(false);
        expect(arrayEquals([1, 2, 1], [1, 2])).to.equal(false);
        expect(arrayEquals(2, [2])).to.equal(false);
    })
})

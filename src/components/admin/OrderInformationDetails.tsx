import {
    Accordion, AccordionDetails, AccordionSummary,
    Button,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Stack,
    Typography
} from "@mui/material";
import React from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import { useSnackbar } from "notistack";
import { ShippingFactory } from "../../store/factories/shipping/ShippingFactory";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { hasPayed, hasShipped } from "../../constants/orderValidation";
import { OrderFactory } from "../../store/factories/order/OrderFactory";
import BookOnlineIcon from "@mui/icons-material/BookOnline";

const ReactJson = dynamic(() => import("react-json-view"), { ssr: false });

const JsonViewer = ({ paymentResult, paymentIntent }) => {
    if (typeof window === "undefined") return null;

    return (
        <ReactJson
            src={{ paymentResult, paymentIntent }}
            name={"details"}
            collapsed
        />
    );
};

export const hasPayedIcon = (order) => {
    return hasPayed(order) ? (
        <CheckIcon color={"success"} />
    ) : (
        <CloseIcon color={"error"} />
    );
};

export const OrderPaymentInformationDetails = ({order, onMarkAsPayed}) => {

    const {enqueueSnackbar} = useSnackbar();

    const handleMarkAsPayed = async () => {
        try {
            await axios.put("/api/admin/order/paid", { orderId: order.id });
            enqueueSnackbar("Marked as pay", { variant: "success" });
            onMarkAsPayed();
        } catch (e) {
            enqueueSnackbar("Error: " + (e?.response?.data ?? e.message), {
                variant: "error"
            });
        }
    };

    return (
        <>
            <Typography>
                Payment Type: {order.paymentType}
                <br />
                Payed: {hasPayedIcon(order)}
                <br />
            </Typography>
            {order.paymentType === "invoice" &&
                !hasPayed(order) && (
                    <Button onClick={handleMarkAsPayed}>
                        Mark as payed
                    </Button>
                )}
            <Divider />
            <Typography>
                Detailed information (in case of payment errors
                for example)
            </Typography>
            <JsonViewer
                paymentIntent={JSON.parse(order.paymentIntent)}
                paymentResult={JSON.parse(order.paymentResult)}
            />
        </>
    )
}

export const OrderDeliveryInformationDetails = ({order, onMarkAsShipped, categories}) => {
    const {enqueueSnackbar} = useSnackbar();

    const handleMarkAsShipped = async () => {
        try {
            await axios.put("/api/admin/order/shipped", { orderId: order.id });
            enqueueSnackbar("Marked as shipped", { variant: "success" });
            onMarkAsShipped();
        } catch (e) {
            enqueueSnackbar("Error: " + (e?.response?.data ?? e.message), {
                variant: "error"
            });
        }
    };

    const generateTickets = async () => {

    };

    const getShippingAddress = () => {
        const shipping = JSON.parse(order.shipping);
        if (shipping.data === "mock" || shipping.data === null || !shipping.data.differentAddress) return order.user;
        return shipping.data.address;
    };

    const address = getShippingAddress();
    return (
        <Stack>
            <Typography>
                Delivery Type:{" "}
                {
                    ShippingFactory.getShippingInstance(
                        JSON.parse(order.shipping)
                    )?.DisplayName
                }
            </Typography>
            <Typography variant={"h6"}>Address</Typography>
            <Typography>
                {address.firstName} {address.lastName}<br />
                {address.address}<br/>
                {address.zip} {address.city}<br />
                {address.countryCode}-{address.regionCode}
            </Typography>
            <Divider sx={{mt: 2, mb: 2}} />
            <TicketList order={order} categories={categories} />
            {
                order.tickets.length === 0 && (
                    <Stack>
                        <Typography variant={"h6"}>No Tickets generated!</Typography>
                        <Button fullWidth onClick={generateTickets}>Generate Tickets</Button>
                    </Stack>
                )
            }

            <List>

            </List>
            {!hasShipped(order) && (
                <Button onClick={handleMarkAsShipped}>
                    Mark as shipped
                </Button>
            )}
            <Divider />
            <Typography>
                Detailed information
            </Typography>
            <ReactJson
                src={JSON.parse(order.shipping)}
                collapsed
            />
        </Stack>
    )
}

const TicketList = ({order, categories}) => {
    const items: Array<{
        categoryId: number;
        seatInformation: string;
    }> = OrderFactory.getInstance(JSON.parse(order.order), categories)?.information ?? [];

    const generateTicket = () => {

    }

    return (
        <Accordion>
            <AccordionSummary>Tickets</AccordionSummary>
            <AccordionDetails>
                <List>
                    {
                        items.map((item, index) => {
                            const category = categories.find(
                                (cat) => cat.id === item.categoryId
                            );
                            if (!category) return null;
                            return (
                                <ListItem key={index} secondaryAction={
                                    <IconButton
                                        edge="end"
                                        aria-label="edit"
                                        color={"primary"}
                                        onClick={generateTicket}
                                    >
                                        <BookOnlineIcon />
                                    </IconButton>}
                                >
                                    <ListItemText primary={category.label} secondary={item.seatInformation} />
                                </ListItem>
                            )
                        })
                    }
                </List>
            </AccordionDetails>
        </Accordion>
    )
}


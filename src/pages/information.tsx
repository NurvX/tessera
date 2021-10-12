import {Step} from "../components/Step";
import {
    Card,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import {useEffect, useState} from "react";
import {CheckboxAccordion} from "../components/CheckboxAccordion";
import {useAppDispatch, useAppSelector} from "../store/hooks";
import {
    selectPersonalInformation, setEmail, setShipping, setAddress,
} from "../store/reducers/personalInformationReducer";
import {disableNextStep, enableNextStep} from "../store/reducers/nextStepAvailableReducer";
import {validateAddress} from "../constants/util";
import {ShippingFactory} from "../store/factories/shipping/ShippingFactory";
import {AddressComponent} from "../components/form/AddressComponent";

const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

export default function Information({direction}) {
    const selector = useAppSelector(selectPersonalInformation);
    const dispatch = useAppDispatch();

    const [selectedShippingMethod, setSelectedShippingMethod] = useState<string>(selector.shipping?.type ?? null);

    useEffect(() => {
        const valid = validateEmail(selector.email) &&
            validateAddress(selector.address) &&
            (ShippingFactory.getShippingInstance(selector.shipping)?.isValid() ?? false);

        if (valid)
            dispatch(enableNextStep());
        else
            dispatch(disableNextStep());
    }, [selector]);

    useEffect(() => {
        if (selectedShippingMethod === null) {
            dispatch(setShipping(null));
            return;
        }
        dispatch(setShipping({
            type: selectedShippingMethod,
            data: "mock"
        }));
    }, [selectedShippingMethod]);

    return (
        <Step direction={direction} style={{width: "100%"}}>
            <Card >
                <Stack padding={1} spacing={1}>
                    <Typography>These address given will be used for invoice.</Typography>
                    <TextField label="E-Mail Address" type="email" value={selector.email} onChange={event => dispatch(setEmail(event.target.value))} />
                    <AddressComponent value={selector.address} onChange={newValue => dispatch(setAddress(newValue))} />
                </Stack>
            </Card>
            <CheckboxAccordion
                label={"Postal delivery"}
                name={"post"}
                selectedItem={selectedShippingMethod}
                onSelect={setSelectedShippingMethod}
            >
                <Typography variant="body2">The ticket will be sent to your home.</Typography>
            </CheckboxAccordion>
            <CheckboxAccordion
                label={"Download"}
                name={"download"}
                selectedItem={selectedShippingMethod}
                onSelect={setSelectedShippingMethod}
            >
                <Typography variant="body2">The ticket will be sent to your email address.</Typography>
            </CheckboxAccordion>
            <CheckboxAccordion
                label={"Box-Office"}
                name={"boxoffice"}
                selectedItem={selectedShippingMethod}
                onSelect={setSelectedShippingMethod}
            >
                <Typography variant="body2">You can pick up your ticket at the Box-Office</Typography>
            </CheckboxAccordion>
        </Step>
    );
}

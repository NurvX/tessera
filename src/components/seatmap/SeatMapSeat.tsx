import style from "./../../style/SeatMap.module.scss";
import {motion} from "framer-motion";
import {Tooltip, Typography} from "@mui/material";
import React, {useEffect, useState} from "react";
import {useAppSelector} from "../../store/hooks";
import {SeatOrder, selectOrder} from "../../store/reducers/orderReducer";

export interface Seat {
    type: "seat" | "space";
    id?: number;
    category?: number;
    amount?: number;
}

export type OnSeatSelect = (seat: Seat, isSelected: boolean) => unknown;

export const SeatMapSeat = ({seat, categories, onSeatSelect}: {seat: Seat, categories: Array<{id: number, label: string, price: number, color?: string, activeColor?: string}>, onSeatSelect?: OnSeatSelect}) => {
    const [isSelected, setIsSelected] = useState(false);
    const orders = useAppSelector(selectOrder) as SeatOrder;

    useEffect(() => {
        setIsSelected(orders.seats?.some(val => val.id === seat.id) ?? false);
    }, [orders]);

    const handleSelect = () => {
        if (onSeatSelect)
            onSeatSelect(seat, !isSelected);
        setIsSelected(prev => !prev);
    };

    const category = categories.find(category => category.id === seat.category);
    if (!category) return null;
    return (
        <Tooltip
            title={
                <React.Fragment>
                    <Typography variant={"body1"}>Category: {category.label}</Typography>
                    <Typography variant={"body1"}>Price: {(category.price * seat.amount).toFixed(2)}€</Typography>
                </React.Fragment>
            }
            disableInteractive
        >
            <motion.div
                className={style.seat}
                style={{height: 40, width: (seat.amount ?? 1) * 40, backgroundColor: !isSelected ? category.color ?? "#59bb59" : category.activeColor ?? "#5959bb"}}
                whileHover={{
                    opacity: 0.6,
                    transition: { duration: 0.1, delay: 0 }
                }}
                onClick={handleSelect}
            >
                <span>{seat.id}</span>
            </motion.div>
        </Tooltip>
    );
};

export const SeatMapSpace = ({seat}: {seat: Seat}) => {
    return (
        <div className={style.seat} style={{height: 40, width: (seat.amount ?? 1) * 40, cursor: "initial"}} />
    );
}

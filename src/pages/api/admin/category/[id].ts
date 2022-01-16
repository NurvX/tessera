import {NextApiRequest, NextApiResponse} from "next";
import {PermissionSection, PermissionType, serverAuthenticate} from "../../../../constants/serverUtil";
import prisma from "../../../../lib/prisma";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
){
    const user = await serverAuthenticate(req, res, {
        permission: PermissionSection.EventCategories,
        permissionType: req.method === "GET" ? PermissionType.Read : PermissionType.Write
    });
    if (!user) return;

    const {id} = req.query;
    const category = await prisma.category.findUnique({
        where: {
            id: parseInt(id as string)
        },
        include: {
            events: true
        }
    });

    if (!category) {
        res.status(404).end("Category not found");
        return;
    }


    if (req.method === "GET") {
        res.status(200).json(category);
        return;
    }

    if (req.method === "DELETE") {
        if (category.events.length > 0) {
            res.status(400).end("Category is in use by events!");
            return;
        }
        await prisma.category.delete({
            where: {
                id: parseInt(id as string)
            }
        });
        res.status(200).end("Deleted");
        return;
    }

    if (req.method === "PUT") {
        const {label, price, color, activeColor, occupiedColor, currency} = req.body;
        const data = {
            ...(label && {label}),
            ...(price && {price}),
            ...(color && {color}),
            ...(activeColor && {activeColor}),
            ...(occupiedColor && {occupiedColor}),
            ...(currency && {currency})
        };
        await prisma.category.update({
            where: {
                id: parseInt(id as string)
            },
            data: data
        });
        res.status(200).end("Updated");
        return;
    }

    res.status(400).end("Method unsupported");
}

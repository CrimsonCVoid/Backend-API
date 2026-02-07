import { Vector3, CFrame, MR_DATA, MR_EDGE, MR_SURF, LINE_TYPE } from "../Shared/index.js";

export type EV_POLYGON = {
    ["@id"]: string;
    ["@orientation"]: string;
    ["@path"]: string;
    ["@pitch"]: string;
    ["@size"]: string;
    ["@unroundedsize"]: string;
};
export type EV_FACE = {
    ["@designator"]: string;
    ["@id"]: string;
    ["@type"]: string;
    ["@children"]: string;
    ["POLYGON"]: EV_POLYGON;
};
export type EV_LINE = {
    ["@id"]: string;
    ["@path"]: string;
    ["@type"]: LINE_TYPE;
};
export type EV_POINT = {
    ["@id"]: string;
    ["@data"]: string;
};
export type EagleView_Report = {
    ["EAGLEVIEW_EXPORT"]: {
        ["REPORT"]: {
            ["@claimId"]: string;
            ["@reportId"]: string;
        };
        ["VERSION"]: {
            ["@coplanarity"]: string;
            ["@dormers"]: string;
            ["@precision"]: string;
            ["@precisionUnits"]: string;
            ["@sourceVersion"]: string;
            ["@targetVersion"]: string;
            ["@triangulation"]: string;
        };
        ["LOCATION"]: {
            ["@address"]: string;
            ["@city"]: string;
            ["@lat"]: string;
            ["@long"]: string;
            ["@postal"]: string;
            ["@state"]: string;
        };
        ["STRUCTURES"]: {
            ["@northorientation"]: string;
            ["ROOF"]: {
                ["@id"]: string;
                ["FACES"]: { FACE: [EV_FACE] };
                ["LINES"]: { LINE: [EV_LINE] };
                ["POINTS"]: { POINT: [EV_POINT] };
            };
        };
    };
};

export function Convert_EagleView(JsonData: string) {
    let Data: EagleView_Report = JSON.parse(JsonData);
    let ROOF = Data.EAGLEVIEW_EXPORT.STRUCTURES.ROOF;
    let ConvData = new MR_DATA(`${Data.EAGLEVIEW_EXPORT.LOCATION["@lat"]}, ${Data.EAGLEVIEW_EXPORT.LOCATION["@long"]}`);
    for (let x of ROOF.POINTS.POINT) ConvData.NewPoint(x["@id"], x["@data"].split(","));
    for (let x of ROOF.LINES.LINE) ConvData.NewEdge(x["@id"], x["@path"].split(","), x["@type"]);
    for (let x of ROOF.FACES.FACE) ConvData.NewSurface(x["@id"], +x.POLYGON["@unroundedsize"], +x.POLYGON["@pitch"], +x.POLYGON["@orientation"], x.POLYGON["@path"].split(","));
    return ConvData;
}
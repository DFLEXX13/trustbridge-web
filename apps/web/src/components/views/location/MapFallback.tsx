/*
Copyright 2024 New Vector Ltd.
Copyright 2022 The Matrix.org Foundation C.I.C.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import React from "react";
import classNames from "classnames";

import MapFallbackImage from "../../../../res/img/location/map.svg?react";
import Spinner from "../elements/Spinner";

import { MapPin as LocationMarkerIcon } from "lucide-react";
interface Props extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
    isLoading?: boolean;
}

const MapFallback: React.FC<Props> = ({ className, isLoading, children, ...rest }) => {
    return (
        <div className={classNames("mx_MapFallback", className)} {...rest}>
            <MapFallbackImage className="mx_MapFallback_bg" />
            {isLoading ? <Spinner size={32} /> : <LocationMarkerIcon className="mx_MapFallback_icon" />}
            {children}
        </div>
    );
};

export default MapFallback;

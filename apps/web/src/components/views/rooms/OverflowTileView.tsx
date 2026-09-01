/*
Copyright 2024 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import React from "react";

import { _t } from "../../../languageHandler";
import AccessibleButton from "../elements/AccessibleButton";

import { ChevronRight as ChevronRightIcon, MoreHorizontal as OverflowHorizontalIcon } from "lucide-react";
interface Props {
    // The number of remaining items
    remaining: number;
    onClick(this: void): void;
}

/**
 * @deprecated Only used in ForwardDialog component; newer designs have moved away from this.
 */
export const OverflowTileView: React.FC<Props> = ({ remaining, onClick }) => {
    return (
        <AccessibleButton onClick={onClick} className="mx_OverflowTileView">
            <div className="mx_OverflowTileView_icon">
                <OverflowHorizontalIcon height="36px" width="36px" />
            </div>
            <div className="mx_OverflowTileView_text">{_t("common|and_n_others", { count: remaining })}</div>
            <ChevronRightIcon className="mx_OverflowTileView_chevron" />
        </AccessibleButton>
    );
};

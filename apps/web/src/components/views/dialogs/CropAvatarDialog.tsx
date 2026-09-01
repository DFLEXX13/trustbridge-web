/*
Copyright 2026 TrustBridge

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { _t } from "../../../languageHandler";
import BaseDialog from "./BaseDialog";
import DialogButtons from "../elements/DialogButtons";

interface IProps {
    file: File;
    onFinished(croppedFile?: File): void;
}

const VIEWPORT_SIZE = 320;
const OUTPUT_SIZE = 512;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

interface Offset {
    x: number;
    y: number;
}

/**
 * Lets the user pan and zoom an image before it's uploaded as an avatar.
 * The image is displayed through a circular guide but the file produced is
 * always a square, matching how avatars are stored and rendered elsewhere.
 */
const CropAvatarDialog: React.FC<IProps> = ({ file, onFinished }) => {
    const imageUrl = useMemo(() => URL.createObjectURL(file), [file]);
    useEffect(() => () => URL.revokeObjectURL(imageUrl), [imageUrl]);

    const imgRef = useRef<HTMLImageElement>(null);
    const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>();
    const [zoom, setZoom] = useState(MIN_ZOOM);
    const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
    const dragState = useRef<{ startX: number; startY: number; startOffset: Offset } | null>(null);

    const baseScale = naturalSize ? VIEWPORT_SIZE / Math.min(naturalSize.width, naturalSize.height) : 1;
    const scale = baseScale * zoom;
    const displayWidth = naturalSize ? naturalSize.width * scale : VIEWPORT_SIZE;
    const displayHeight = naturalSize ? naturalSize.height * scale : VIEWPORT_SIZE;

    const clampOffset = useCallback(
        (o: Offset, width: number, height: number): Offset => ({
            x: Math.min(0, Math.max(VIEWPORT_SIZE - width, o.x)),
            y: Math.min(0, Math.max(VIEWPORT_SIZE - height, o.y)),
        }),
        [],
    );

    const onImageLoad = useCallback((): void => {
        const img = imgRef.current;
        if (!img) return;
        const size = { width: img.naturalWidth, height: img.naturalHeight };
        setNaturalSize(size);
        const initialScale = VIEWPORT_SIZE / Math.min(size.width, size.height);
        setOffset({
            x: (VIEWPORT_SIZE - size.width * initialScale) / 2,
            y: (VIEWPORT_SIZE - size.height * initialScale) / 2,
        });
    }, []);

    const onZoomChange = useCallback(
        (newZoom: number): void => {
            if (!naturalSize) return;
            const oldScale = baseScale * zoom;
            const newScale = baseScale * newZoom;
            // Keep the point currently at the viewport centre fixed while zooming.
            const centreImageX = (VIEWPORT_SIZE / 2 - offset.x) / oldScale;
            const centreImageY = (VIEWPORT_SIZE / 2 - offset.y) / oldScale;
            const newOffset = {
                x: VIEWPORT_SIZE / 2 - centreImageX * newScale,
                y: VIEWPORT_SIZE / 2 - centreImageY * newScale,
            };
            setZoom(newZoom);
            setOffset(clampOffset(newOffset, naturalSize.width * newScale, naturalSize.height * newScale));
        },
        [naturalSize, baseScale, zoom, offset, clampOffset],
    );

    const onPointerDown = useCallback(
        (e: React.PointerEvent<HTMLDivElement>): void => {
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            dragState.current = { startX: e.clientX, startY: e.clientY, startOffset: offset };
        },
        [offset],
    );

    const onPointerMove = useCallback(
        (e: React.PointerEvent<HTMLDivElement>): void => {
            if (!dragState.current || !naturalSize) return;
            const dx = e.clientX - dragState.current.startX;
            const dy = e.clientY - dragState.current.startY;
            const newOffset = {
                x: dragState.current.startOffset.x + dx,
                y: dragState.current.startOffset.y + dy,
            };
            setOffset(clampOffset(newOffset, displayWidth, displayHeight));
        },
        [naturalSize, displayWidth, displayHeight, clampOffset],
    );

    const onPointerUp = useCallback((): void => {
        dragState.current = null;
    }, []);

    const onWheel = useCallback(
        (e: React.WheelEvent<HTMLDivElement>): void => {
            e.preventDefault();
            const delta = -e.deltaY * 0.0015;
            const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom + delta));
            if (newZoom !== zoom) onZoomChange(newZoom);
        },
        [zoom, onZoomChange],
    );

    const onSave = useCallback((): void => {
        const img = imgRef.current;
        if (!img || !naturalSize) return;

        // The viewport is always a square, so the region of the source image it
        // covers is a square too: work it out in the image's own pixel space.
        const srcSize = VIEWPORT_SIZE / scale;
        const srcX = -offset.x / scale;
        const srcY = -offset.y / scale;

        const canvas = document.createElement("canvas");
        canvas.width = OUTPUT_SIZE;
        canvas.height = OUTPUT_SIZE;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            onFinished(undefined);
            return;
        }
        ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

        const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    onFinished(undefined);
                    return;
                }
                const croppedFile = new File([blob], file.name, { type: mimeType, lastModified: Date.now() });
                onFinished(croppedFile);
            },
            mimeType,
            0.92,
        );
    }, [file, naturalSize, scale, offset, onFinished]);

    return (
        <BaseDialog
            className="mx_CropAvatarDialog"
            onFinished={() => onFinished(undefined)}
            title={_t("crop_avatar|title")}
            contentId="mx_CropAvatarDialog_content"
        >
            <div className="mx_Dialog_content" id="mx_CropAvatarDialog_content">
                <div
                    className="mx_CropAvatarDialog_viewport"
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                    onWheel={onWheel}
                >
                    <img
                        ref={imgRef}
                        src={imageUrl}
                        alt=""
                        draggable={false}
                        onLoad={onImageLoad}
                        style={{
                            width: displayWidth,
                            height: displayHeight,
                            transform: `translate(${offset.x}px, ${offset.y}px)`,
                        }}
                    />
                    <div className="mx_CropAvatarDialog_mask" />
                </div>
                <div className="mx_CropAvatarDialog_zoomRow">
                    <input
                        type="range"
                        className="mx_CropAvatarDialog_zoomSlider"
                        min={MIN_ZOOM}
                        max={MAX_ZOOM}
                        step={0.01}
                        value={zoom}
                        aria-label={_t("crop_avatar|zoom_label")}
                        onChange={(e) => onZoomChange(parseFloat(e.target.value))}
                    />
                </div>
            </div>
            <DialogButtons
                primaryButton={_t("crop_avatar|save_button")}
                onPrimaryButtonClick={onSave}
                onCancel={() => onFinished(undefined)}
            />
        </BaseDialog>
    );
};

export default CropAvatarDialog;

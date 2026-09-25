/*
*   image_functions is used to apply some standard suite of
*   options to images users provide before we legofy them.
*   Using this as separate file just to keep each aspect simple and clean.
*   Also can be used for other things like tinting the individual bricks perhaps
*   If we want more accurate colors we can make images in the correct colors instead of tiniting, but tiniting easier.
*/

// Original Idea was to use the Jimp library. There's a lot of Node/commonJS imports and issues so just making my own functions to maniuplate an ImageData.

class Image_Functions {

    constructor() {

    }

    // helper functions to do mean/median/mode of values.

    getMedian(list: Array<number>) {

        const sorted = [...list].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        // Long line basically if even return the average of the 2 middle, if odd return the middle element.
        return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

    }

    getMean(list: Array<number>) {
        const initVal = 0;
        const sum = list.reduce((tempSum, val) => tempSum + val, initVal);

        return (sum / list.length);
    }

    getMode(list: Array<number>) {
        // have a dictionary of val to occurances
        const values: Map<number, number> = new Map<number, number>();

        for (let i = 0; i < list.length; i++) {

            if (values.has(list[i])) {
                values.set(list[i], values.get(list[i])! + 1);
            } else {
                values.set(list[i], 1);
            }
        }

        // We have the list and frequency. Sort it largest to lowest and return the largest.
        const sorted = [...values].sort((a, b) => b[1] - a[1]);
        return sorted[0][0]; // key is the value we want to return;

    }


    /**
     * Resizes an ImageData object asynchronously using ImageBitmap.
     * @param {ImageData} imageData - The original ImageData object.
     * @param {number} newWidth - The target width.
     * @param {number} newHeight - The target height.
     * @returns {Promise<ImageData>} A promise that resolves to the resized ImageData.
     */
    async resizeImageData(imageData: ImageData, newWidth: number, newHeight: number) {
        // 1. Convert ImageData to a bitmap using the window's native handler
        const bitmap = await window.createImageBitmap(imageData, 0, 0, imageData.width, imageData.height, {
            resizeWidth: newWidth,
            resizeHeight: newHeight,
            resizeQuality: 'high' // Options: 'low', 'medium', 'high'
        });

        // 2. Create an offscreen canvas to extract the scaled pixels
        const canvas = new OffscreenCanvas(newWidth, newHeight);


        const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;

        // 3. Draw the bitmap onto the canvas and extract the updated ImageData
        ctx.drawImage(bitmap, 0, 0);
        const resizedData = ctx.getImageData(0, 0, newWidth, newHeight);

        // 4. Clean up the bitmap memory explicitly
        bitmap.close();

        return resizedData;
    }

    async preProcessImage(img: ImageData, pixelSize: number = 30, contrastVal: number = 25, brightnessVal: number = 25, saturateVal: number = 25, pixelMode: number = 0) {
        try {
            // We have default settings. Based on Pixel size, we should resize the image so there's no extra pixels, it'll all be within the pixelSize dimensions.
            // I.e no 10 pixel long edge pieces.

            // resize time.
            const newWidth = img.width - (img.width % pixelSize);
            const newHeight = img.height - (img.height % pixelSize);


            const resizedImg = await this.resizeImageData(img, newWidth, newHeight);


            // do everything else before doing pixel

            // Since this mutates the imageData return the same thing and it works.
            this.contrast(resizedImg, contrastVal);
            this.brightness(resizedImg, brightnessVal);
            this.saturate(resizedImg, saturateVal);

            this.pixelize(resizedImg, pixelSize, pixelMode);


            return resizedImg;
        } catch (error) {
            console.error(error);
        }


    }

    // Pixelize pixelates the image based on pixelsize. Just doing this to make the lego brick process easier.
    // mode is a number (int) that defines are we doing Mean, Median, Mode, or First for the color for the pixel.
    // "enum" is essentially: 0 = Mode, 1 = Median, 2 = Mean, 3 = First. Generally I think Mode is best but is a customizable option.
    pixelize(img: ImageData, pixelSize: number = 30, mode: number = 0) {
        // We loop through the image data in blocks equal to pixel size.

        // Since we need to move in visual space on X and Y, but image data is just one array left right top bottom
        // order, we need to know width and height to calculate the index to edit.
        const data = img.data;
        const width = img.width;
        const height = img.height;

        // loop on y axis
        for (let y = 0; y < height; y += pixelSize) {
            // loop on x axis
            for (let x = 0; x < width; x += pixelSize) {
                // Get the top left index for reference.
                const topLeftIndex = (y * width + x) * 4; // x 4 because RGBA list.

                // need to determine the color to assign to the whole block.
                let r, g, b, a;
                r = 0;
                g = 0;
                b = 0;
                a = 1;

                const rList: Array<number> = [];
                const gList: Array<number> = [];
                const bList: Array<number> = [];
                const aList: Array<number> = [];
                // for everything but first pixel we need a list of all the R, G, B, and A values for the block.
                if (mode != 3) {
                    for (let blockY = 0; blockY < pixelSize; blockY++) {
                        for (let blockX = 0; blockX < pixelSize; blockX++) {
                            const currentY = y + blockY;
                            const currentX = x + blockX;

                            // don't go beyond the image
                            if (currentX < width && currentY < height) {
                                const targetIndex = (currentY * width + currentX) * 4;
                                rList.push(data[targetIndex]);
                                gList.push(data[targetIndex + 1]);
                                bList.push(data[targetIndex + 2]);
                                aList.push(data[targetIndex + 3]);
                            }
                        }
                    }
                }

                switch (mode) {
                    case 0:
                        // Mode - ie the value is whatever is the most occuring color.
                        r = this.getMode(rList);
                        g = this.getMode(gList);
                        b = this.getMode(bList);
                        a = this.getMean(aList);

                        break;
                    case 1:
                        r = this.getMedian(rList);
                        g = this.getMedian(gList);
                        b = this.getMedian(bList);
                        a = this.getMedian(aList);

                        break;
                    case 2:
                        r = this.getMean(rList);
                        g = this.getMean(gList);
                        b = this.getMean(bList);
                        a = this.getMean(aList);
                        break;
                    case 3:
                        // First Pixel determines it
                        r = data[topLeftIndex];
                        g = data[topLeftIndex + 1];
                        b = data[topLeftIndex + 2];
                        a = data[topLeftIndex + 3];
                        break;

                }


                // Once RGBA are assigned, apply it to the whole block.
                for (let blockY = 0; blockY < pixelSize; blockY++) {
                    for (let blockX = 0; blockX < pixelSize; blockX++) {
                        const currentY = y + blockY;
                        const currentX = x + blockX;

                        // don't go beyond the image
                        if (currentX < width && currentY < height) {
                            const targetIndex = (currentY * width + currentX) * 4;
                            data[targetIndex] = r;
                            data[targetIndex + 1] = g;
                            data[targetIndex + 2] = b;
                            data[targetIndex + 3] = a;
                        }
                    }
                }

            }
        }



        return img
    }

    // Change the contrast of the image. Input: -100 to 100 (I.e percent increase/decrease)
    contrast(img: ImageData, contrastVal: number = 25) {
        const data = img.data;
        const contrast = (contrastVal / 100) + 1;
        const intercept = 128 * (1 - contrast);
        for (let i = 0; i < data.length; i += 4) {
            data[i] = data[i] * contrast + intercept;
            data[i + 1] = data[i + 1] * contrast + intercept;
            data[i + 2] = data[i + 2] * contrast + intercept;

        }
        return img;
    }

    // Increase the brightness. Value between -100 and 100
    brightness(img: ImageData, brightnessVal: number = 25) {

        const brightClamp = Math.min(Math.max(brightnessVal, -100), 100);
        const data = img.data;
        // we've clamped brightness to the -100 to 100 range.

        // formula is: newVal = curVal + 255*(Brightness/100);

        for (let i = 0; i < data.length; i += 4) {
            data[i] = data[i] + 255 * (brightClamp / 100);
            data[i + 1] = data[i + 1] + 255 * (brightClamp / 100);
            data[i + 2] = data[i + 2] + 255 * (brightClamp / 100);
        }

        return img;
    }
    // Saturate the image. Pass a value larger than 1 for increased saturation (i.e 1.25 == 25% more saturated), less than 1 larger than 0 to reduce saturation, with 0 being -100% saturation/greyscale
    saturate(img: ImageData, saturateVal: number = 1.25) {

        const data = img.data;

        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];

            // convert to HSL
            r = r / 255;
            g = g / 255;
            b = b / 255
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);

            let h = (max + min) / 2;
            let s: number;
            const l = (max + min) / 2;
            if (max === min) {
                h = s = 0; // achromatic (grayscale)
            } else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }

            // We have the HSL, Saturate it
            s = Math.min(1, Math.max(0, s * saturateVal));
            if (s === 0) {
                r = g = b = l; // achromatic
            } else {
                const hue2rgb = (p, q, t) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1 / 6) return p + (q - p) * 6 * t;
                    if (t < 1 / 2) return q;
                    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                    return p;
                };

                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
            }

            data[i] = Math.round(r * 255);
            data[i + 1] = Math.round(g * 255);
            data[i + 2] = Math.round(b * 255);

        }



        return img;
    }


    create_tinted_image(img: HTMLImageElement, tintColor: string) {
        // draw img to offscreen canvas, tint it, then return the canvas to put it on the main canvas.

        const buff = new OffscreenCanvas(img.width, img.height);
        const bCtx = buff.getContext("2d") as OffscreenCanvasRenderingContext2D;

        bCtx.fillStyle = tintColor;

        bCtx.fillRect(0, 0, buff.width, buff.height);



        // bCtx.globalCompositeOperation = "destination-atop";
        // bCtx.drawImage(img, 0, 0);

        bCtx.globalCompositeOperation = "overlay";
        bCtx.drawImage(img, 0, 0);


        return buff;

    }
}

export default Image_Functions;
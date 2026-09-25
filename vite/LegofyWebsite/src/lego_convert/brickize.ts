import Palettes from "./palettes";
import Image_Functions from "./image_functions";

class Brickerize {
    colors: Palettes;
    img_func: Image_Functions;
    brick_image: HTMLImageElement;
    constructor() {
        this.colors = new Palettes();
        this.img_func = new Image_Functions();
        this.brick_image = document.getElementById('1x1') as HTMLImageElement;
    }


    // helper function to turn hex to color and vice versa.
    componentToHex = (c: number) => {
        const hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    rgbToHex = (r: number, g: number, b: number) => {
        return "#" + r.toString(16).padStart(2, "0") + g.toString(16).padStart(2, "0") + b.toString(16).padStart(2, "0");
    }

    hexToRgb = (hex: string) => {
        // we have a full #654321 string. Let's turn it into an rgb array

        const r = parseInt(hex.substring(1, 3), 16);
        const g = parseInt(hex.substring(3, 5), 16);
        const b = parseInt(hex.substring(5, 7), 16);

        return [r, g, b];
    }






    /*
    *   getClosestColor will be given an image, pixel position, and the number of pixels width/height of the brick that'll be placed. Boolean for if just b/w or full color palette.
    */
    getClosestColor(img: ImageData, index: number, monoColor: boolean = false) {
        // Get the palette to compare against
        let compareColors = this.colors.solidPalette;
        if (monoColor)
            compareColors = this.colors.monoPalette;

        // Since the image has been pixelized, we only need to compare the color at the index we are at.

        // The Palette is storing the RGB as a Hex format string. Turn it into RGB values.

        const data = img.data;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];



        // sort the palette so the first element is the closest color.
        let closestColor = "";
        let minDistance = Infinity;
        for (let i = 0; i < compareColors.length; i++) {
            const palette = compareColors[i];
            const color = this.hexToRgb(palette.hexColor);
            if (!color) {
                continue;
            }
            const distance =
                Math.pow(r - color[0], 2) +
                Math.pow(g - color[1], 2) +
                Math.pow(b - color[2], 2);

            if (distance < minDistance) {
                minDistance = distance;
                closestColor = this.rgbToHex(color[0], color[1], color[2]);
            }
        }


        // that's a muddy comparision. Let's instead either compare based on r, g, b or h, s, l values.
        // returns the JSON object so we have all the info for the brick as needed.
        return closestColor;





    }

    // Process Image gets the loaded arrayBuffer image the user has uploaded and does stuff to it.
    // We default pre-process it using Jimp in a separate class.
    async processImage(img: ImageData, pixelSize: number = 30, contrastVal: number = 0, brightnesVal: number = 0, saturateVal: number = 1.0, pixelMode: number = 1, monoColor: boolean = false) {
        try {
            const processImage = await this.img_func.preProcessImage(img, pixelSize, contrastVal, brightnesVal, saturateVal, pixelMode) as ImageData;


            // We have processed the image. We mutated it so it should be the same image.





            // we have an Image Data. Turn it into something to render to the image if needed (or draw it to the on screen canvas until we're done with it);



            // How do we want to render the bricks? Let's draw the bricks to our output canvas.

            // first, get the brick image(s):
            const brickImage = new Image(30, 30);
            brickImage.src = "/src/assets/bricks/1x1.png";

            // iterate through the image data.

            // setup the canvas to draw to
            const tempCanvas = document.getElementById("on_screen_canvas") as HTMLCanvasElement;
            tempCanvas.width = processImage.width;
            tempCanvas.height = processImage.height;
            const tempCtx = tempCanvas.getContext("2d");

            tempCtx?.putImageData(processImage, 0, 0);



            for (let y = 0; y < processImage.height; y += pixelSize) {
                for (let x = 0; x < processImage.width; x += pixelSize) {
                    // turn this into pixelIndex
                    const topLeftIndex = (y * processImage.width + x) * 4; // x 4 because RGBA list.
                    const color = this.getClosestColor(processImage, topLeftIndex, monoColor);
                    const brick = this.img_func.create_tinted_image(this.brick_image, color);

                    // we know the brick should scale based on pixelSize, with pixelSize = 30 being normal size.


                    tempCtx?.drawImage(brick, x, y, 30 * (pixelSize / 30), 30 * (pixelSize / 30));

                }
            }


            // get it as an image to download easier


            const output_Image = document.getElementById("end_image") as HTMLImageElement;
            output_Image.src = tempCanvas.toDataURL();



        } catch (error) {
            console.error(error);
        }













    }


}



export default Brickerize;
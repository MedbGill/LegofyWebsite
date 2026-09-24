import Palettes from "./palettes";

class Brickerize {
    colors: Palettes;
    constructor() {
        this.colors = new Palettes();
    }

    sayHello() {
        console.log("Hello");
    }

    /*
    *   getClosestColor will be given an image, pixel position, and the number of pixels width/height of the brick that'll be placed. Boolean for if just b/w or full color palette.
    */
    getClosestColor(img: ImageData, x: bigint, y: bigint, checkWidth: bigint, checkHeight: bigint, monoColor: boolean, pixelInterval?: number) {
        // Get the palette to compare against
        let compareColors = this.colors.solidPalette;
        if (monoColor)
            compareColors = this.colors.monoPalette;



        // Go through the img at position for width/height and figure out closest color in palette.

        // Create the median color
        let totalRed, totalGreen, totalBlue = 0;

        let increment = 1;
        if (pixelInterval) {
            increment = pixelInterval;
        }
        // Loop through every column/row combo to get the median RGB value
        for (let i = 0; i < checkHeight; i += increment) {
            for (let n = 0; n < checkWidth; n += increment) {
                // Get pixel, add the values up.
            }
        }

        // Compare with our brick colors to see if there's a close enough match.
    }


}



export default Brickerize;
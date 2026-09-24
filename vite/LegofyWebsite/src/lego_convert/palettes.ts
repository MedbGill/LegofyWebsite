// Class that generates the palettes we will use.
// 
import data from "/src/assets/bricks/colors.csv";

interface PaletteJSON {
    brickLinkId: number;
    colorLabel: string;
    legoColorLabel: string;
    hexColor: string;
    legoID: number;
}

class Palettes {

    solidPalette: Array<PaletteJSON>;

    monoPalette: Array<PaletteJSON>;

    constructor() {
        // Read the colors csv and fill out the palettes (With white/black being added to mono as well)

        this.solidPalette = [];
        this.monoPalette = [];

        if (Array.isArray(data)) {
            data.forEach(element => {
                this.solidPalette.push({
                    brickLinkId: element.id,
                    colorLabel: element.name,
                    legoColorLabel: element.Legoname,
                    hexColor: "#" + element.rgb,
                    legoID: element.legoID,
                });

                if (element.name == "White" || element.name == "Black") {
                    this.monoPalette.push({
                        brickLinkId: element.id,
                        colorLabel: element.name,
                        legoColorLabel: element.Legoname,
                        hexColor: "#" + element.rgb,
                        legoID: element.legoID,
                    });
                }
            });
        }
    }



}

export default Palettes;



const sharp = require("sharp");
const path = require("path");

const assetsFolder = path.join(__dirname, "src", "assets");

const images = [
    "gaming.png",
    "hackathon.png",
    "robotics.png",
    "workshop.png"
];

async function optimizeImages() {
    for (const image of images) {
        const input = path.join(assetsFolder, image);
        const output = path.join(
            assetsFolder,
            image.replace(".png", ".webp")
        );

        await sharp(input)
            .webp({ quality: 80, effort: 6 })
            .toFile(output);

        console.log("Optimized:", image, "->", path.basename(output));
    }

    console.log("All images optimized successfully!");
}

optimizeImages().catch(console.error);

const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('products.js', 'utf8');
const imagesRoot = path.join(__dirname, 'images');

function findImages(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(findImages(filePath));
        } else {
            results.push(filePath);
        }
    });
    return results;
}

const allImages = findImages(imagesRoot);
let updatedCount = 0;

allImages.forEach(imgPath => {
    let relPath = imgPath.replace(__dirname + path.sep, '').replace(/\\/g, '/');
    const ext = path.extname(imgPath);
    let baseName = path.basename(imgPath, ext);
    let matchName = baseName.replace(/ \(\d+\)/g, '').trim();

    // Escape matchName for regex
    let escapedMatchName = matchName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    
    // Find item: "matchName" in products array
    let regex = new RegExp(`item:\\s*["']${escapedMatchName}["']([^}]*)}`, "i");
    
    // check if it is in content
    if (regex.test(content)) {
        content = content.replace(regex, (match, p1) => {
            if (!match.includes('image:')) {
                updatedCount++;
                // rebuild the object properly handling the trailing space before closing brace
                let trimP1 = p1.replace(/,\s*$/, '').replace(/\s*$/, '');
                return `item: "${matchName}"${trimP1}, image: "${relPath}" }`;
            }
            return match;
        });
    }
});

fs.writeFileSync('products.js', content);
console.log(`Matched and updated ${updatedCount} images.`);

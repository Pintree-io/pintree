const fs = require('fs');
const cheerio = require('cheerio');

/**
 * Function to parse bookmarks HTML file and convert it to JSON with support for folders
 * @param {string} html
 * @returns {Array} JSON array of bookmarks
 */
function parseBookmarks(html) {
    // Load the HTML into cheerio
    const $ = cheerio.load(html);

    /**
     * Function to recursively extract bookmark data
     * @param {cheerio.Cheerio<Element>} node
     * @returns {Array} JSON array of bookmarks
     */
    function parseFolder(node) {
        let result = [];

        for (const child of node.children('dt')) {
            const $child = $(child);

            if ($child.find('h3').length > 0) { // If it's a folder
                const titleElement = $child.find('h3').first();
                let folderData = {
                    type: "folder",
                    addDate: parseInt(titleElement.attr("ADD_DATE")),
                    title: titleElement.text().trim(),
                    children: []
                };

                // The DL element containing the folder contents
                if ($child.find('dl').length > 0) {
                    folderData.children = parseFolder($child.find('dl').first());
                }

                result.push(folderData);
            } else if ($child.find('a').length > 0) {  // If it's a link/bookmark
                const linkNode = $child.find('a').first();
                result.push({
                    type: "link",
                    addDate: parseInt(linkNode.attr("ADD_DATE")),
                    title: linkNode.text().trim(),
                    icon: linkNode.attr("icon"),
                    url: linkNode.attr('href'),
                });
            }
        };

        return result;
    }

    // Start extracting bookmarks from the root node
    const rootNode = $('h1 + dl');
    return parseFolder(rootNode);
}

const args = process.argv.slice(2);

if (args.includes('--help') || args.length === 0) {
    console.log('Script for parsing Chrome bookmarks file into JSON.');
    console.log('\nUsage:');
    console.log('  node converter.js [input_file] [output_file]');
    console.log('\nExample:');
    console.log('  node ./utils/converter.js ./bookmarks.html ./json/pintree.json');
    return;
}

if (args.length < 2) {
    console.log('Error: requires at least 2 arg(s), only received ', args.length);
    console.log('\nUsage:');
    console.log('  node converter.js [input_file] [output_file]');
    return;
}

// Path to your bookmarks HTML file
const filePath = args[0];

// Read the HTML file
const htmlContent = fs.readFileSync(filePath, 'utf-8');
const bookmarksJSON = parseBookmarks(htmlContent);

// Write the JSON data to a file
const outFilePath = args[1]; // Path to your bookmarks JSON file
fs.writeFile(outFilePath, JSON.stringify(bookmarksJSON, null, 2), (err) => {
    if (err) {
        console.error('Error writing JSON file:', err);
    } else {
        console.log('Bookmarks successfully converted to JSON and saved to ' + outFilePath);
    }
});

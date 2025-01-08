// Package used to parse the HTML elements to extract table contents
import {load } from 'cheerio';

const googleDocUrl = "https://docs.google.com/document/d/e/2PACX-1vQGUck9HIFCyezsrBSnmENk5ieJuYwpt7YHYEzeNJkIb9OSDdx-ov2nRNReKQyey-cwJOoEKUhLmN9z/pub";

async function main() {
    // Fetch the HTML contents of the Google Doc
    var htmlText = await fetchDocumentHtml(googleDocUrl);
    
    // If the HTML contents were successfully fetched, parse the contents and build the message
    if (htmlText) {
        // Parse the Google Doc HTML to extract the contents and maximum x, y values
        const { matrix, xMax, yMax } = parseGoogleDocHTML(htmlText);
        // Build the message from the matrix and maximum x, y values
        const message = buildMessage(matrix, xMax, yMax);
        console.log(message);
    }
}

// Helper function to fetch the HTML contents of a Google Doc
async function fetchDocumentHtml(url) {
    try {
        // Fetch the HTML contents of the Google Doc and return as a string
        const response = await fetch(url);
        const htmlText = await response.text();
        return htmlText;
    } catch (error) {
        console.error("Failed to fetch Google Doc HTML: ", error);
        return null;
    }
}

// Helper function to parse the HTML contents into a table based on the HTML structure.
// Based on inspeciton of the Google Doc HTML structure, each cell is contained within a span element,
// and each row is contained within a tr element.
//
// Returns an object { matrix, xMax, yMax } where, where matrix is in the format [[x0, char0, y0], [x1, char1, y1], ...],
function parseGoogleDocHTML(htmlText) {
    // Load the HTML contents using Cheerio, and initialize the matrix
    const $dom = load(htmlText);
    var matrix = [];

    // Variables to track the max x and y values occurring in the table
    var xMax = -1;
    var yMax = -1;

    // Traverse the DOM, adding contents of each <span> within the <tr> elements into the matrix
    $dom('tr').find('span').each((i, elem) => {
        // Get row and column from the table 
        const row = Math.floor(i / 3);
        const col = i % 3;

        // Skip the header row of the table
        if (row === 0) return;

        // Get the value from the span element
        const value = $dom(elem).text();

        // If the column is 0, then we need to add a new row to the matrix,
        // and update the xMax value if the value is greater than the current xMax
        if (col === 0) {
            matrix.push([]);
            xMax = Math.max(xMax, value);
        }

        // col === 1 is the character in the matrix

        // Update the yMax value if the value is greater than the current yMax
        if (col === 2) {
            yMax = Math.max(yMax, value);
        }

        // Add the value to the current row of the matrix
        matrix[row - 1].push(value);

    });

    return {
        matrix: matrix,
        xMax: xMax,
        yMax: yMax
    }
}

// Helper function to build the message from the matrix and maximum x, y values
function buildMessage(matrix, xMax, yMax) {

    var messageMatrix = [];
    var message = "";

    // Construct a 2D array to store the message, initialized with spaces
    // yMax and xMax are the maximum indices (i.e. size is yMax + 1 and xMax + 1)
    for (var i = 0; i <= yMax; i++) {
        messageMatrix[i] = [];
        for (var j = 0; j <= xMax; j++) {
            messageMatrix[i][j] = " ";
        }
    }

    // For each row in the matrix, extract the x, y coordinates and character
    // and store the character in the message matrix
    for (var row in matrix) {
        var x = matrix[row][0];
        var y = matrix[row][2];
        var character = matrix[row][1];
        // Use yMax - y to flip the y-axis so that the message is displayed correctly
        messageMatrix[yMax - y][x] = character;
    }

    // Add each row of the message matrix to the message string as a new line
    for (var i = 0; i <= yMax; i++) {
        message += messageMatrix[i].join("") + "\n";
    }

    return message;
}

// Call the main function to start the process
main();
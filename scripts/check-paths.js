const fs = require('fs');
const path = require('path');

function updatePaths(directory) {
    const files = fs.readdirSync(directory);
    
    files.forEach(file => {
        const filePath = path.join(directory, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
            updatePaths(filePath);
        } else if (file.endsWith('.html')) {
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Update CSS link
            content = content.replace(
                /<link rel="stylesheet" href="[^"]*styles\.css">/,
                '<link rel="stylesheet" href="/css/styles.css">'
            );
            
            // Update JS links
            if (file === 'register.html') {
                if (!content.includes('register.js')) {
                    content = content.replace(
                        '</body>',
                        '    <script src="/js/register.js"></script>\n</body>'
                    );
                }
            }
            
            fs.writeFileSync(filePath, content);
        }
    });
}

// Run the script
updatePaths('./src/pages'); 
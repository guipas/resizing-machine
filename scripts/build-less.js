const less = require('less');
const fs = require('fs');

fs.readFile('./less/style.less', (error, content) => {
  const data = content.toString();
  less.render(data)
    .then((output) => {
      fs.writeFile('./css/style.css', output.css, (err) => {
        if (err) console.log(err);
      });
    });
});

const $ = require('jquery');
const Jimp = require("jimp");

function preventAll(event) {
  event.preventDefault();
  event.stopPropagation();
}

function log(text) {
  $('.logs .console').prepend('<span class="log">' + text + '</span>');
}

$("html").on("dragover", (e) => {
  preventAll(e);
  $('.dragover-zone').addClass('dragover');
});

$("html").on("dragleave", (e) => {
  preventAll(e);
});

$("html").on("dragleave", '.dragover-zone', (e) => {
  preventAll(e);
  $('.dragover-zone').removeClass('dragover');
});

$("html").on("drop", function(event) {
  $('.dragover-zone').removeClass('dragover');
  event.preventDefault();
  event.stopPropagation();
  const files = event.originalEvent.dataTransfer.files;
  const pathes = [];
  //log(files);
  for (let i = 0; i < files.length; i++) {
    pathes.push({
      path: files[i].path,
      name: files[i].name,
    });
  }
  doTheWork(pathes);
});

function processFile(img, file, options) {
  log('size: ' + img.bitmap.width + 'x' + img.bitmap.height);

  /* ROTATION */
  const rotation = parseInt(options.rotation);
  if (rotation !== 0) {
    log('Rotating image by ' + rotation + ' degrees');
    img.rotate(rotation);
  }

  /* Crop */
  if (options.crop !== '') {
    if (options.crop === 'rect') {
      log("Rectangular cropping");
      const ratio = 4.0 / 3.0;
      const w = (img.bitmap.height * ratio <= img.bitmap.width) ? img.bitmap.height * ratio : img.bitmap.width;
      const h = (img.bitmap.height * ratio <= img.bitmap.width) ? img.bitmap.height : img.bitmap.width / ratio;
      const x = img.bitmap.width / 2 - w / 2;
      const y = img.bitmap.height / 2 - h / 2;
      img.crop( x, y, w, h);
    } else {//square
      log("Square cropping");
      const side = (img.bitmap.width < img.bitmap.height) ? img.bitmap.width : img.bitmap.height;
      const x = img.bitmap.width / 2 - side / 2;
      const y = img.bitmap.height / 2 - side / 2;
      img.crop( x, y, side, side );
    }
  }

  /* RESIZING */
  if( options.size_choice === 'sizes') {// constrain image to given width and/or height
    log('Resizing by max width/height...');
    let max_width = img.bitmap.width;
    let max_height = img.bitmap.height;
    if (options.max_width) {
      log('Max width set (' + options.max_width_value + ')');
      max_width = parseInt(options.max_width_value);
    }
    if (options.max_height) {
      log('Max height set (' + options.max_height_value + ')');
      max_height = parseInt(options.max_height_value);
    }
    img.scaleToFit(max_width, max_height);
  } else if (options.size_choice === 'ratio') {
    let ratio = 1;
    if (parseFloat(options.ratio) < 1 && parseFloat(options.ratio) > 0) ratio = parseFloat(options.ratio);
    log('Resizing by ratio (' + ratio + ')');
    img.scale(ratio);
  }

  /* SAVING */
  let newPath = file.path;
  // output folder defined ?
  if (options.output_folder) {
    newPath = options.output_folder_value;
    if (newPath.lastIndexOf('/') !== newPath.length -1 || newPath.lastIndexOf('\\') !== newPath.length -1) {
      newPath += '/';
    }
    newPath += file.name;
  }
  const size = '' + img.bitmap.width + 'x' + img.bitmap.height;
  if (options.location === 'auto') {
    log('File name generated automatically');

    let newName = '' + Date.now() + '_' + size + '_' + file.name;
    newPath = file.path.replace(file.name, newName);
    //log('size: ' + img.bitmap.width + 'x' + img.bitmap.height);
  } else if (options.location === 'custom') {
    let newName = options.location_name;
    newName = newName.replace('[i]', index);
    newName = newName.replace('[time]', Date.now());
    newName = newName.replace('[size]', size);
    log('Custom file name: ' + newName);
    newPath = file.path.replace(file.name, newName);
  } // else we keep original name (override file)

  img.write(newPath, () => log('File saved (' + newPath + ')'));

}

function doTheWork(images) {
  const options = angular.element($('#options-form')).scope().$ctrl.options;
  log('###');
  log('Processing files ...');
  let prom = null;
  images.forEach( (file, index) => {
    //chain promises to work on sync (one file at a time) :
    if (index === 0) {
      prom = Jimp
        .read(file.path)
        .then((img) => {processFile(img,file,options)})
        .catch((err) => log(err));
    } else {
      prom.then(() => {
        return Jimp.read(file.path)
        .then((img) => {processFile(img,file,options)})
        .catch((err) => log(err));
      });
    }
  });
}

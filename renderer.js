const angular = require('angular');

class AppController {
  $onInit() {
    this.options = {
      location: "auto",
      output_folder: false,
      ratio: "1",
      rotation: "0",
      size_choice: "ratio",
    };
  }
  go() {
    console.log(this.options);
  }
}

const AppComponent = {
  controller: AppController,
  templateUrl: 'app.component.template.html',
}

angular
  .module('app', [])
  .component('app', AppComponent);

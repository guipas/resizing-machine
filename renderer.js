const angular = require('angular');

class AppController {
  $onInit() {
    this.options = {};
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

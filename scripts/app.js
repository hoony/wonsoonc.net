'use strict';

angular
  .module('wonsoonApp', [
    'ngRoute'
  ])
  .config(function ($routeProvider, $httpProvider) {
    $routeProvider
      .when('/date/:date', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
	  .when('/all', {
		templateUrl: 'views/all.html',
		controller: 'AllCtrl'
	  })
      .otherwise({
        redirectTo: '/all'
      });
  });

var app = angular.module('app', 
  ['ionic', 'utilitiesModule', 'directives', 'wu.masonry', 'betModule'])
.run(function () {
  Parse.initialize(CONFIG.appId, CONFIG.masterKey);
  Parse.serverURL = CONFIG.serverURL;
})
.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $locationProvider) {
  $ionicConfigProvider.scrolling.jsScrolling(true);
  $ionicConfigProvider.navBar.alignTitle("center");

  $stateProvider

  .state('bet', {
    url: "/",
    templateUrl: "app/bet/bet-list.html",
    controller: 'BetListCtrl'
  });

  $locationProvider.html5Mode(true);

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise( function($injector, $location) {
      var $state = $injector.get("$state");
      $state.go("bet");
  });
});
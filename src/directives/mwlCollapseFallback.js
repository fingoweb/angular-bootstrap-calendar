'use strict';

var angular = require('angular');

angular
  .module('mwl.calendar')
  .controller('MwlCollapseFallbackCtrl', function($scope, $attrs, $element) {

    var vm = this;

    vm.$onInit = function() {
      $scope.$watch($attrs.mwlCollapseFallback, function(shouldCollapse) {
        if (shouldCollapse) {
          $element.addClass('ng-hide');
        } else {
          $element.removeClass('ng-hide');
        }
      });
    };

  })
  .directive('mwlCollapseFallback', function($injector) {

    if ($injector.has('uibCollapseDirective')) {
      return {};
    }

    return {
      restrict: 'A',
      controller: 'MwlCollapseFallbackCtrl'
    };

  });

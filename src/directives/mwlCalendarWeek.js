'use strict';

var angular = require('angular');

angular
  .module('mwl.calendar')
  .controller('MwlCalendarWeekCtrl', function($scope, $sce, moment, calendarHelper, calendarConfig) {

    var vm = this;
    vm.showTimes = calendarConfig.showTimesOnWeekView;
    vm.$sce = $sce;

    vm.setCalParams = function() {
      vm.dayViewSplit = vm.dayViewSplit || 30;
      vm.dayViewHeight = calendarHelper.getDayViewHeight(
        vm.dayViewStart,
        vm.dayViewEnd,
        vm.dayViewSplit
      );
      if (vm.showTimes) {
        vm.view = calendarHelper.getWeekViewWithTimes(
          vm.events,
          vm.currentDay,
          vm.dayViewStart,
          vm.dayViewEnd,
          vm.dayViewSplit
        );
      } else {
        vm.view = calendarHelper.getWeekView(vm.events, vm.currentDay);
      }
    };
    vm.setCalParams();

    $scope.$on('calendar.refreshView', function() {
      vm.setCalParams();

    });

    vm.formatDate = function(date, format) {
      return moment(date).format(format);
    };

    vm.weekDragged = function(event, daysDiff, minuteChunksMoved) {

      var newStart = moment(event.startsAt).add(daysDiff, 'days');
      var newEnd = moment(event.endsAt).add(daysDiff, 'days');

      if (minuteChunksMoved) {
        var minutesDiff = minuteChunksMoved * vm.dayViewSplit;
        newStart = newStart.add(minutesDiff, 'minutes');
        newEnd = newEnd.add(minutesDiff, 'minutes');
      }

      delete event.tempStartsAt;

      vm.onEventTimesChanged({
        calendarEvent: event,
        calendarNewEventStart: newStart.toDate(),
        calendarNewEventEnd: event.endsAt ? newEnd.toDate() : null
      });
    };

    vm.isDaySelected = function(date) {
      return !vm.selectedEvent.id && !!vm.selectedEvent.date && vm.formatDate(date, 'Y-MM-DD') === vm.selectedEvent.date;
    };

    vm.weekResized = function(event, edge, daysDiff) {

      var start = moment(event.startsAt);
      var end = moment(event.endsAt);
      if (edge === 'start') {
        start.add(daysDiff, 'days');
      } else {
        end.add(daysDiff, 'days');
      }

      vm.onEventTimesChanged({
        calendarEvent: event,
        calendarNewEventStart: start.toDate(),
        calendarNewEventEnd: end.toDate()
      });
    };

    vm.dayClicked = function(day, dayClickedFirstRun, $event) {
      if (!dayClickedFirstRun) {
        vm.onTimespanClick({
          calendarDate: day.date.toDate(),
          $event: $event
        });
      }
    };
    vm.eventClicked = function(event, eventClickedFirstRun, $event) {
      if (!eventClickedFirstRun) {
        vm.onEventClick({
          event: event,
          $event: $event
        });
      }
    };

    vm.tempTimeChanged = function(event, minuteChunksMoved) {
      var minutesDiff = minuteChunksMoved * vm.dayViewSplit;
      event.tempStartsAt = moment(event.startsAt).add(minutesDiff, 'minutes').toDate();
    };

  })
  .directive('mwlCalendarWeek', function(calendarUseTemplates) {

    return {
      template: calendarUseTemplates ? require('./../templates/calendarWeekView.html') : '',
      restrict: 'EA',
      require: '^mwlCalendar',
      scope: {
        events: '=',
        currentDay: '=',
        onEventClick: '=',
        selectedEvent: '=',
        onEventTimesChanged: '=',
        dayViewStart: '=',
        dayViewEnd: '=',
        dayViewSplit: '=',
        onTimespanClick: '='
      },
      controller: 'MwlCalendarWeekCtrl as vm',
      link: function(scope, element, attrs, calendarCtrl) {
        scope.vm.calendarCtrl = calendarCtrl;
      },
      bindToController: true
    };

  });

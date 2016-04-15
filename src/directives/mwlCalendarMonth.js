'use strict';

var angular = require('angular');

angular
  .module('mwl.calendar')
  .controller('MwlCalendarMonthCtrl', function($scope, moment, calendarHelper, calendarConfig) {

    var vm = this;
    vm.calendarConfig = calendarConfig;

    $scope.$on('calendar.refreshView', function() {
      vm.weekDays = calendarHelper.getWeekDayNames();

      vm.view = calendarHelper.getMonthView(vm.events, vm.currentDay, vm.cellModifier);
      var rows = Math.floor(vm.view.length / 7);
      vm.monthOffsets = [];
      for (var i = 0; i < rows; i++) {
        vm.monthOffsets.push(i * 7);
      }

      //Auto open the calendar to the current day if set
      if (vm.cellIsOpen && !vm.openRowIndex) {
        vm.openDayIndex = null;
        vm.view.forEach(function(day) {
          if (day.inMonth && moment(vm.currentDay).startOf('day').isSame(day.date)) {
            vm.dayClicked(day, true);
          }
        });
      }
    });

    vm.formatDate = function(date, format) {
      return moment(date).format(format);
    };

    vm.isExpanded = function(id) {
      return vm.expandedId === id;
    };

    vm.expand = function(id, $event) {
      vm.expandedId = id;
      $event.stopPropagation();
    };

    vm.collapse = function($event) {
      vm.expandedId = null;
      $event.stopPropagation();
    };

    vm.collapseWithCheck = function(day, $event) {
      var anotherDayClicked = vm.formatDate(day, 'Y-MM-DD') !== vm.expandedId;
      if (anotherDayClicked) {
        vm.collapse($event);
        return false;
      }
      return true;
    };

    vm.dayClicked = function(day, dayClickedFirstRun, $event) {
      if (!dayClickedFirstRun) {
        if (vm.collapseWithCheck(day.date, $event)) {
          return;
        }
        vm.onTimespanClick({
          calendarDate: day.date.toDate(),
          $event: $event
        });
        if ($event && $event.defaultPrevented) {
          return;
        }
      }

      vm.openRowIndex = null;
      var dayIndex = vm.view.indexOf(day);
      if (dayIndex === vm.openDayIndex) { //the day has been clicked and is already open
        vm.openDayIndex = null; //close the open day
        vm.cellIsOpen = false;
      } else {
        vm.openDayIndex = dayIndex;
        vm.openRowIndex = Math.floor(dayIndex / 7);
        vm.cellIsOpen = true;
      }

    };

    vm.eventClicked = function(event, eventClickedFirstRun, $event) {
      if (!eventClickedFirstRun) {
        vm.collapseWithCheck(event.startsAt, $event);
        vm.onEventClick({
          calendarEvent: event,
          $event: $event
        });
      }
    };

    vm.highlightEvent = function(event, shouldAddClass) {

      vm.view.forEach(function(day) {
        delete day.highlightClass;
        if (shouldAddClass) {
          var dayContainsEvent = day.events.indexOf(event) > -1;
          if (dayContainsEvent) {
            day.highlightClass = 'day-highlight dh-event-' + event.type;
          }
        }
      });

    };

    vm.handleEventDrop = function(event, newDayDate) {

      var newStart = moment(event.startsAt)
        .date(moment(newDayDate).date())
        .month(moment(newDayDate).month());

      var newEnd = calendarHelper.adjustEndDateFromStartDiff(event.startsAt, newStart, event.endsAt);

      vm.onEventTimesChanged({
        calendarEvent: event,
        calendarDate: newDayDate,
        calendarNewEventStart: newStart.toDate(),
        calendarNewEventEnd: newEnd ? newEnd.toDate() : null
      });
    };

  })
  .directive('mwlCalendarMonth', function(calendarUseTemplates) {

    return {
      template: calendarUseTemplates ? require('./../templates/calendarMonthView.html') : '',
      restrict: 'EA',
      require: '^mwlCalendar',
      scope: {
        events: '=',
        currentDay: '=',
        onEventClick: '=',
        selectedEvent: '=',
        onEditEventClick: '=',
        onDeleteEventClick: '=',
        onEventTimesChanged: '=',
        editEventHtml: '=',
        deleteEventHtml: '=',
        cellIsOpen: '=',
        onTimespanClick: '=',
        cellModifier: '=',
        cellTemplateUrl: '@',
        cellEventsTemplateUrl: '@'
      },
      controller: 'MwlCalendarMonthCtrl as vm',
      link: function(scope, element, attrs, calendarCtrl) {
        scope.vm.calendarCtrl = calendarCtrl;
      },
      bindToController: true
    };

  });

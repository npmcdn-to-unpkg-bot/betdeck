angular.module('directives', [])
.directive(
    'ngEnter', 
    function () {
        'use strict';

        return function (scope, element, attrs) {
            console.log("AWDWA");
            element.bind("keydown keypress", function (event) {
                if(event.which === 13) {
                    scope.$apply(function (){
                        scope.$eval(attrs.ngEnter);
                    });

                    event.preventDefault();
                }
            });
        };
    })
.directive('whenScrolled', function() {
    return function(scope, elm, attr) {
        var raw = elm[0];
        
        elm.bind('scroll', function() {
            if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
                scope.$apply(attr.whenScrolled);
            }
        });
    };
})
// Focuses input
.directive('isFocused', function($timeout) {
  return {
    scope: { trigger: '&isFocused' },
    link: function(scope, element) {
        if(scope.trigger()) {
          $timeout(function() {
            element[0].focus();
            element[0].click();
          });
        }
    }
  };
})
// Opens all links in new windows
.directive('targetBlank', function() {
  return {
    compile: function(element) {
      var elems = (element.prop("tagName") === 'A') ? element : element.find('a');
      elems.attr("target", "_blank");
    }
  };
})
.directive(
  'isVisible', 
  function () {
    'use strict';

    return function (scope, element, attrs) {
      if(!element[0].hidden){
        var value = element[0].id;
        if(!value)
          value = element[0].classList[0];
        scope.$emit('visible', value);
      }
    };
})
.directive('lowerCase', function() {
   return {
     require: 'ngModel',
     link: function(scope, element, attrs, modelCtrl) {
        modelCtrl.$parsers.push(function (inputValue) {

         var transformedInput = inputValue.toLowerCase().replace(/ /g, ''); 

         if (transformedInput!=inputValue) {
           modelCtrl.$setViewValue(transformedInput);
           modelCtrl.$render();
         }         

         return transformedInput;         
       });
     }
   };
});
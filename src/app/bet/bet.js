// Component directory
var homeDir = "./app/bet/";

angular.module('betModule', [])
.controller('BetListCtrl', function($scope, BetFactory, UtilitiesFactory, $timeout) {

    $scope.options = {
        limit: 1000,
        difficulty: 0
    };

    $scope.bets = [];

    UtilitiesFactory.showToast("Loading...");
    BetFactory.getBets($scope.options).then(function(bets){
        $scope.bets = bets;
        $scope.filteredBets = bets;
        UtilitiesFactory.hideToast();
    }, function(error){
        UtilitiesFactory.hideToast();
    });

    $scope.filter = function(difficulty){
        $scope.options.difficulty = difficulty;
        $scope.filteredBets = [];
        var tmp = angular.copy($scope.bets);
        if(difficulty > 0){
            for(var i = 0; i < tmp.length; i++){
                if(tmp[i].difficulty == difficulty)
                    $scope.filteredBets.push(tmp[i]);
            }
        }
        else
            $scope.filteredBets = tmp;
    }

    $scope.bet = function() {
        UtilitiesFactory.showToast("3...");
        $timeout(function(){
            UtilitiesFactory.showToast("2...")
        }, 1000);
        $timeout(function(){
            UtilitiesFactory.showToast("1...")
        }, 2000);
        $timeout(function(){
            UtilitiesFactory.hideToast();
            UtilitiesFactory.showModal("./app/bet/bet-detail.html", $scope);
        }, 3000);
    };

    $scope.showBetAddModal = function() { UtilitiesFactory.showModal("./app/bet/bet-add-modal.html", $scope); };

    $scope.hideModal = function(){
        UtilitiesFactory.hideModal();
    };

})
.controller('BetAddCtrl', function($scope, BetFactory, UtilitiesFactory) {
    $scope.bet = {
        difficulty: 1,
        description: ""
    };

    $scope.addBet = function(){
        UtilitiesFactory.showToast("Adding bet...");
        BetFactory.addBet($scope.bet).then(function(result){
            $scope.bets.unshift(result);
            if($scope.options.difficulty == $scope.bet.difficulty)
                $scope.filteredBets.unshift(result);
            UtilitiesFactory.hideModal();
            UtilitiesFactory.showToast("Bet added!", 1500);
        });
    };
})
.controller('BetDetailCtrl', function($scope, UtilitiesFactory) {
    var index = ~~(Math.random() * $scope.filteredBets.length);
    $scope.bet = $scope.filteredBets[index];
    
    $scope.completeBet = function(){
        UtilitiesFactory.hideModal();
        $scope.filteredBets.splice(index, 1);
        if($scope.filteredBets.length <= 0){
            $scope.filter($scope.options.difficulty);
            UtilitiesFactory.showToast("Resetting...", 2000);
        }
    };
})
.factory('BetFactory', function($q, UtilitiesFactory) {
    
    return {
        getBets: function(options){
            var deferred = $q.defer();
            var q = new Parse.Query("Bet");
            q.limit(options.limit);
            q.skip(options.page*options.limit);
            if(options.difficulty && options.difficulty > -1)
                q.equalTo("difficulty", options.difficulty);
            q.find().then(function(results){
                if(results && results.length > 0){
                    deferred.resolve(results.map(function(result){
                        return UtilitiesFactory.flattenParseObj(result);
                    }));
                }
                else
                    deferred.reject();
            });
            return deferred.promise;
        },
        addBet: function(bet){
            var deferred = $q.defer();
            var tmp = new Parse.Object("Bet");
            tmp.set("description", bet.description);
            tmp.set("difficulty", parseInt(bet.difficulty));
            tmp.save().then(function(result){
                deferred.resolve(UtilitiesFactory.flattenParseObj(result));
            });
            return deferred.promise;
        }
    }
});

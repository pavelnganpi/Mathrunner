Players = new Meteor.Collection('players');
Games = new Meteor.Collection('games');

reset = function() {
  Players.find().forEach(function(player) {
    Players.remove(player._id);
  });

  Games.find().forEach(function(game) {
    Games.remove(game._id);
  });
};

addends = function() {
  var addend1 = [], addend2 = [];

  for (var i = 0; i < 1000; i++) {
    addend1.push(Math.round(Random.fraction() * 10));
    addend2.push(Math.round(Random.fraction() * 10));
  }

  return [addend1, addend2];
};

me = function() {
  return Players.findOne({ _id: Session.get('id') });
};

if (Meteor.isClient) {
  Template.hello.count = function() {
    return Players.find().count();
  };

  Template.hello.players = function() {
    return Players.find().fetch();
  };

  Template.hello.winner = function() {
    return Players.findOne({ winner: true });
  };

  Template.hello.gameWon = function() {
    return Games.findOne({ won: true });
  };

  Template.hello.gameOn = function() {
    return Games.findOne();
  };

  Template.hello.question = function() {
    var game = Games.findOne();
    var num = me().question || 0;

    return { addend1: game.addends[0][num],
             addend2: game.addends[1][num] };
  };

  Template.hello.events({
    'submit #joingame': function(e) {
      e.preventDefault();
      var id = Players.insert({ name: $('#myname').val() });
      Session.set('id', id);
    },

    'click #startgame': function() {
      Games.insert({ addends: addends(), won: false });
    },

    'submit #answer': function(e) {
      e.preventDefault();
      var game = Games.findOne();

      if (game.won) {
        return;
      }

      var num = me().question || 0;
      var score = me().score || 10;
      var sum = game.addends[0][num] + game.addends[1][num];
      var answer = $('#myanswer').val();

      $('#myanswer').val('');

      if (score >= 100) {
        Players.update(Session.get('id'), {
          $set: { winner: true }
        });

        Games.update(game._id, {
          $set: { won: true }
        });

        return;
      }

      if (answer == sum) {
        Players.update(Session.get('id'), {
          $set: { question: num + 1, score: score + 10 }
        });

        return;
      }

      alert('Wrong!');
    }
  });

  Meteor.subscribe('players');
  Meteor.subscribe('games');
}

if (Meteor.isServer) {
  Meteor.startup(function() {
    // code to run on server at startup
  });
}

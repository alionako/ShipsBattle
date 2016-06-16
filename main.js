// 0 - horisontal
// 1 - vertical
var gRotateState = 0;
var gCursorRow = 0;
var gCursorCol = 0;

var img_id = null;
var jimg_id= null;

var gBusyCells = {};
var gBusyCellsForEnemy = {};
var gEnemyShips = {};
var gOurShips = {};
var gStartState = false;
var gOurCounter = 20;
var gEnemyCounter = 20;
var gEnemyPlans = []; // Планы на ячейки
var gShopCounter = 10;

function startGame () {
  gStartState = true;
  $("#ships").fadeOut("slow");
  $(".instructions").fadeOut("slow");
}

function Ship() {
  this.cells = [];
  this.around= [];
  this.putCell = function(cell) {
    this.cells.push({id:cell,hit:true});
  }
  this.hitPie = function(cell) {
    for (var i = 0; i < this.cells.length; i++) {
      if (this.cells[i].id == cell) {
        this.cells[i] = false;
        break;
      }
    }
  }
  this.isSank = function() {
    for (var i = 0; i < this.cells.length; i++) {
      if (this.cells[i].hit) {
        return false;
      }
    }
    return true;
  }
  this.getAround = function() {
    return this.around;
  }
  this.putIntoAround = function(cell) {
    this.around.push(cell);
  }
}

$(document).ready(function(){
  var enemyField = document.getElementById('enemyField');
  var n = 100;

  for (var i = 0; i < n; i++)
  {
    var div = document.createElement('div');
    div.row = Math.floor(i / 10);
    div.col = i % 10;
    div.id=['ecellId', div.row, div.col].join('');
    $(div.id).row = div.row;
    $(div.id).col = div.col;
    enemyField.appendChild(div);

    gEnemyPlans.push(['#cellId', div.row, div.col].join(''));
  }

  var i = gEnemyPlans.length;
  if ( i === 0 ) {
    return false;
  }
  while (--i) {
      var j = Math.floor( Math.random() * ( i + 1 ) );
      var temp = gEnemyPlans[i];
      gEnemyPlans[i] = gEnemyPlans[j];
      gEnemyPlans[j] = temp;
  }

  matrixInit();

  shipsTableInit();

  $('#img_4').count = 1;
  $('#img_3').count = 2;
  $('#img_2').count = 3;
  $('#img_1').count = 4;
});

  $(function() {

    $( "#ships img" ).draggable({
      helper:'clone',
      start:function(){
        img_id = this.id;
        jimg_id= ['#', this.id].join('');
      }
    });

  function getCurrentShipLen(id) {
    if (id == undefined) {
      if (img_id=="img_1")
          return 1;
        if (img_id=="img_2")
          return 2;
        if (img_id=="img_3")
          return 3;
        if (img_id=="img_4")
          return 4;
      }
      else {
        if (id=="bomb")
          return 1;
        if (id=="ship")
          return 2;
        if (id=="submarine")
          return 3;
        if (id=="titanic")
          return 4;
      }
      return undefined;
  }

  function getCurrentShipClass(id) {
      if (img_id=="img_1")
          return 'bomb';
        if (img_id=="img_2")
          return 'ship';
        if (img_id=="img_3")
          return 'submarine';
        if (img_id=="img_4")
          return 'titanic';
      return undefined;
  }

  function getCurrentTextId(id) {
    if (id == undefined) {
      if (img_id=="img_1")
          return "#textId1";
        if (img_id=="img_2")
          return "#textId2";
        if (img_id=="img_3")
          return "#textId3";
        if (img_id=="img_4")
          return "#textId4";
      }
      else {
        if (id=="bomb")
          return "#textId1";
        if (id=="ship")
          return "#textId2";
        if (id=="submarine")
          return "#textId3";
        if (id=="titanic")
          return "#textId4";
      }
      return undefined;
  }

  function getImgIdByShipClass(shipClass)
  {
    if (shipClass == 'titanic') {
      return 'img_4';
    }

    if (shipClass == 'submarine') {
      return 'img_3';
    }

    if (shipClass == 'ship') {
      return 'img_2';
    }

    return 'img_1';
  }

  $('body').keydown(function(event) {
    if (event.keyCode != 82) {
      return;
    }

    gRotateState = gRotateState == 1 ? 0 : 1;
    var len = getCurrentShipLen();

    var col = gCursorCol;
    var row = gCursorRow;

    for (var i = 0; i < len; i++) {
      if (gRotateState == 1) {
        $(['#cellId',row, col + i].join('')).removeClass('selected');
        $(['#cellId',row, col + i].join('')).removeClass('unavailable');
        $(['#cellId',row + i, col].join('')).addClass('selected');
      }
      else {
        $(['#cellId',row + i, col].join('')).removeClass('selected');
        $(['#cellId',row + i, col].join('')).removeClass('unavailable');
        $(['#cellId',row, col + i].join('')).addClass('selected');
      }
    }
  });

  function putShip (row, col, shipClass, rot, busy, cellPrefix, ships) {

    var count = 0;
    for (var k in ships) {
        if (ships.hasOwnProperty(k)) {
           ++count;
        }
    }

    var shipId = [shipClass, count].join('');
    var ship = new Ship();
    ships[shipId] = ship;

    var textId = getCurrentTextId(shipClass);
    var localImgId = getImgIdByShipClass(shipClass);
    var img = document.getElementById(localImgId);

        if (img.count > 0) {
          img.count--;
          $(textId).html(img.count);
        }
        if (img.count == 0) {
          $('#'+localImgId).draggable('disable');
        }

    var len = getCurrentShipLen(shipClass);

    for (var i = 0; i < len; i++) {
        if(rot == 1) {
          cellId = [cellPrefix, row + i, col].join('');

          if (col != 9) {
            busy[[cellPrefix, row + i, col+1].join('')] = true;
            ship.putIntoAround([cellPrefix, row + i, col+1].join(''));
          }

          if (col != 0) {
            busy[[cellPrefix, row + i, col-1].join('')] = true;
            ship.putIntoAround([cellPrefix, row + i, col-1].join(''));
          }
        }
        else {
          cellId = [cellPrefix, row, col + i].join('');

          if (row != 9) {
            busy[[cellPrefix, row + 1, col + i].join('')] = true;
            ship.putIntoAround([cellPrefix, row + 1, col + i].join(''));
          }

          if (row != 0) {
            busy[[cellPrefix, row - 1, col + i].join('')] = true;
            ship.putIntoAround([cellPrefix, row - 1, col + i].join(''));
          }
        }

        busy[cellId] = true;
        $(cellId).removeClass('selected');
        $(cellId).addClass(shipClass);
        $(cellId).attr('shipId', shipId);
        ship.putCell(cellId);
      }

      if (rot == 1) {

        if (row + len < 10) {
          if (col + 1 < 10) {
            busy[[cellPrefix, row+len, col+1].join('')] = true;
            ship.putIntoAround([cellPrefix, row+len, col+1].join(''));
          }

          if (col != 0) {
            busy[[cellPrefix, row+len, col-1].join('')] = true;
            ship.putIntoAround([cellPrefix, row+len, col-1].join(''));
          }
          busy[[cellPrefix, row+len, col].join('')] = true;
          ship.putIntoAround([cellPrefix, row+len, col].join(''));
        }

        if (row != 0) {
          if (col + 1 < 10) {
            busy[[cellPrefix, row-1, col+1].join('')] = true;
            ship.putIntoAround([cellPrefix, row-1, col+1].join(''));
          }

          if (col != 0) {
            busy[[cellPrefix, row-1, col-1].join('')] = true;
            ship.putIntoAround([cellPrefix, row-1, col-1].join(''));
          }
          busy[[cellPrefix, row-1, col].join('')] = true;
          ship.putIntoAround([cellPrefix, row-1, col].join(''));
        }
      }
      else {
        if (col + len < 10) {
          if (row + 1 < 10) {
            busy[[cellPrefix, row+1, col+len].join('')] = true;
            ship.putIntoAround([cellPrefix, row+1, col+len].join(''));
          }

          if (row != 0) {
            busy[[cellPrefix, row-1, col+len].join('')] = true;
            ship.putIntoAround([cellPrefix, row-1, col+len].join(''));
          }
          busy[[cellPrefix, row, col+len].join('')] = true;
          ship.putIntoAround([cellPrefix, row, col+len].join(''));
        }

        if (col != 0) {
          if (row + 1 < 10) {
            busy[[cellPrefix, row+1, col-1].join('')] = true;
            ship.putIntoAround([cellPrefix, row+1, col-1].join(''));
          }

          if (row != 0) {
            busy[[cellPrefix, row-1, col-1].join('')] = true;
            ship.putIntoAround([cellPrefix, row-1, col-1].join(''));
          }
          busy[[cellPrefix, row, col-1].join('')] = true;
          ship.putIntoAround([cellPrefix, row, col-1].join(''));
        }
      }
  }

  function canPut(row, col, shipClass, rot, busy, cellPrefix) {
    var len = getCurrentShipLen(shipClass);
    if (rot == 1) {
      for (var i = 0; i < len; i++) {
        if (busy[[cellPrefix, row + i, col].join('')]) {
          return false;
        }
      }
    }
    else {
      for (var i = 0; i < len; i++) {
        if (busy[[cellPrefix, row, col + i].join('')]) {
          return false;
        }
      }
    }
    return true;
  }

  function randomFor(busy, cellPrefix, ships) {
    var randRow = Math.floor(7 * Math.random());
    var randCol = Math.floor(7 * Math.random());
    var randRot = Math.floor(2  * Math.random());

    putShip(randRow, randCol, "titanic", randRot, busy, cellPrefix, ships);

    for (var i = 0; i < 2; i++) {
      do {
        randRow = Math.floor(8 * Math.random());
        randCol = Math.floor(8 * Math.random());
        randRot = Math.floor(2  * Math.random());
      } while (canPut(randRow, randCol, "submarine", randRot, busy, cellPrefix) == false);

      putShip(randRow, randCol, "submarine", randRot, busy, cellPrefix, ships);
    }

    for (var i = 0; i < 3; i++) {
      do {
        randRow = Math.floor(9 * Math.random());
        randCol = Math.floor(9 * Math.random());
        randRot = Math.floor(2  * Math.random());
      } while (canPut(randRow, randCol, "ship", randRot, busy, cellPrefix) == false);

      putShip(randRow, randCol, "ship", randRot, busy, cellPrefix, ships);
    }

    for (var i = 0; i < 4; i++) {
      do {
        randRow = Math.floor(10 * Math.random());
        randCol = Math.floor(10 * Math.random());
        randRot = Math.floor(2  * Math.random());
      } while (canPut(randRow, randCol, "bomb", randRot, busy, cellPrefix) == false);

      putShip(randRow, randCol, "bomb", randRot, busy, cellPrefix, ships);
    }
  }

  function randomForEnemy() {
    randomFor(gBusyCellsForEnemy, '#ecellId', gEnemyShips);
  }

  function randomForUs() {
    randomFor(gBusyCells, '#cellId', gOurShips);
  }

  $('#randomButtonId').click(function(event, ui){

    if (gStartState == true) {
      alert("The game has started! You are not able to replace the ships anymore!");
      return;
    }

    randomForUs();
    randomForEnemy();

    startGame();
    //gStartState = true;
  });

  $('#enemyField div').click(function(event, ui){
    if (gStartState == false) {
      return;
    }

    if (gEnemyCounter == 0) {
      return;
    }

    if ($(this).hasClass('hit') || $(this).hasClass('opened')) {
      return;
    }

    var isHit = $(this).hasClass("ship") || $(this).hasClass("bomb") || $(this).hasClass("submarine") || $(this).hasClass("titanic");
    if (isHit == false) {
      $(this).addClass('opened');
    }
    else {

      $(this).addClass('hit');

      var ship = gEnemyShips[$(['#ecellId', this.row, this.col].join('')).attr('shipId')];
      ship.hitPie('#'+$(this).attr('id'));

      if (ship.isSank()) {
        var cells = ship.getAround();
        for (var i = 0; i < cells.length; i++) {
          $(cells[i]).addClass('opened');
        }
      }

      gEnemyCounter--;
      $(gEnemyCounterId).html("Enemy ships left: "+gEnemyCounter);

      if (gEnemyCounter == 0) {
        alert('You win!!!');
        location.reload();
        return;
      }
    }

    var cellId = gEnemyPlans[gEnemyPlans.length-1];
    gEnemyPlans.pop();
    isHit = $(cellId).hasClass('ship') || $(cellId).hasClass("bomb") || $(cellId).hasClass("submarine") || $(cellId).hasClass("titanic");

    if (isHit == false) {
      $(cellId).addClass('opened');
    }
    else {
      $(cellId).addClass('hit');

      var ship = gOurShips[$(cellId).attr('shipId')];
      ship.hitPie(cellId);
      if (ship.isSank()) {
        var cells = ship.getAround();
        for (var i = 0; i < cells.length; i++) {
          $(cells[i]).addClass('opened');

          var j = 0;
          for (j = 0; j < gEnemyPlans.length; j++) {
            if (gEnemyPlans[j] == cells[i]) {
              break;
            }
          }

          if (j != gEnemyPlans.length) {
            gEnemyPlans.splice(j, 1);
          }
        }
      }

      gOurCounter--;
      $("#gOurCounterId").html("Your ships left: "+gOurCounter);

      if (gOurCounter == 0) {
        alert('You loose!!!');
        location.reload();
        return;
      }
    }
  });

  $( "#ourField div" ).droppable({
    accept: "#ships img",
        over: function (event, ui) {

      var len=getCurrentShipLen();

          var col = this.col;
          var row = this.row;

          gCursorCol = col;
          gCursorRow = row;

          var currentClass = 'selected';

          for (var i = 0; i < len; i++) {
            var cellId = "";
            if(gRotateState == 1) {
              cellId = ['#cellId',row + i, col].join('');
            } else {
              cellId = ['#cellId',row, col + i].join('');
            }

            if (gBusyCells[cellId]) {
              currentClass = "unavailable";
              break;
            }
          }

          for (var i = 0; i < len; i++) {

            if(gRotateState == 1) {
              var cellId = ['#cellId',row + i, col].join('');
              $(cellId).addClass(currentClass);
            }
            else {
              var cellId = ['#cellId',row, col + i].join('');
          $(cellId).addClass(currentClass);
            }
          }

        },
        out:function (event, ui) {
          var len=getCurrentShipLen();

          var col = this.col;
          var row = this.row;

          for (var i = 0; i < len; i++) {
            if(gRotateState == 1) {
              $(['#cellId',row + i,col].join('')).removeClass('selected');
              $(['#cellId',row + i,col].join('')).removeClass('unavailable');
            } else if(gRotateState == 0) {
              $(['#cellId',row,col + i].join('')).removeClass('selected');
              $(['#cellId',row,col + i].join('')).removeClass('unavailable');
        }
          }
        },
        drop: function( event, ui ) {

          var col = this.col;
          var row = this.row;

          var shipClass=getCurrentShipClass();
          var textId = getCurrentTextId();
      var len=getCurrentShipLen();

          var cellId = ['#cellId', row, col].join('');

          if ($(cellId).hasClass('unavailable')) {
            for (var i = 0; i < len; i++) {
              if (gRotateState == 1) {
                $(['#cellId', row + i, col].join('')).removeClass('unavailable');
              }
              else {
                $(['#cellId', row, col+i].join('')).removeClass('unavailable');
              }
            }
            return;
          }

          if (gRotateState == 1) {
            if (row + len > 10) {
              for (var i = 0; i < 10; ++i) {
                $(['#cellId', row + i, col].join('')).removeClass('selected');
              }
              return;
            }
          }
          else {
            if (col + len > 10) {
              for (var i = 0; i < 10; ++i) {
                $(['#cellId', row, col+i].join('')).removeClass('selected');
              }
              return;
            }
          }

        putShip(row, col, shipClass, gRotateState, gBusyCells, '#cellId', gOurShips);

        gShopCounter--;
        if (gShopCounter == 0) {
          randomForEnemy();
        startGame();
        //gStartState = true;
        alert('Start game! Click on your enemy field to shoot.')
        }
        }
    });
});

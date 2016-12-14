/**
 * Created by Steven on 12/12/2016.
 */

var gameStarted = false;
var timer;
var curTime = 0;
var grid = [];
var size;
var difficulty;
var bombCount;
var score;
var cheating = false;
var cheated = false;



$(document).ready(function(){
    $('#start').click(start);
    $('#cheat').click(toggleCheat);
});

function Cell(i,j,isBomb){
    this.x = i;
    this.y = j;
    this.state = "normal";
    this.isBomb = isBomb;
}

function startTimer(){
    timer = setInterval(function(){
        curTime++;
        $('#time-gone').html(curTime);
    },1000);
}

function stopTimer(){
    if(timer){
        clearInterval(timer);
    }
}

function countNeighbors(i,j){
    var count = 0;
    for(var x = i - 1; x <= i + 1; ++x){
        for (var y = j - 1; y <= j + 1; ++y){
            if(x >= 0 && x < size && y >= 0 && y < size && (x != i || y != j) && grid[x][y].isBomb === true)
                count++;
        }
    }
    return count;
}

function cellClick(i,j){
    return function(){
        cellClickHelper(i,j,true);
        if(checkWin())
            win();
    };
}

function cellClickHelper(i,j,originalClick){
    var cell = grid[i][j];
    if(cell.state == "clicked" || cell.state == "flag") return;
    if(originalClick && cell.state =="question") return;
    cell.state = "clicked";
    if(cell.isBomb)
        return lose();

    if(gameStarted === false){
        gameStarted = true;
        startTimer();
    }

    var n = countNeighbors(i,j);
    if(n > 0)
        cell.but.html(n);
    colorCell(cell.but, n);
    if(n == 0){
        for(var x = i - 1; x <= i + 1; ++x){
            for (var y = j - 1; y <= j + 1; ++y){
                if(x >= 0 && x < size && y >= 0 && y < size && (x != i || y != j))
                    cellClickHelper(x,y,false);
            }
        }
    }
}

function start(){
    $('#start').prop("disabled", true);
    $('#cell-table').empty();
    size = parseInt($('#size').val());
    difficulty = parseFloat($('#dif').val());
    bombCount = Math.round(size * size * difficulty);
    console.log(bombCount);
    $('#bombs-left').html(bombCount);

    var curBomb = 0;
    var row;
    var data;
    for(var i = 0; i < size; ++i){
        grid[i] = [];
        row = $("<tr></tr>");
        for(var j = 0; j < size; ++j){
            var rand = Math.random();
            if(rand < difficulty && curBomb < bombCount) {
                grid[i][j] = new Cell(i, j, true);
                curBomb++;
            }
            else {
                grid[i][j] = new Cell(i, j, false);
            }
            //if(!grid[i][j].isBomb)
                grid[i][j].but = $('<button>&nbsp;</button>').click(cellClick(i,j)).contextmenu(contextClick(i,j));
           // else
            //    grid[i][j].but = $('<button>B</button>').click(cellClick(i,j)).contextmenu(contextClick(i,j));
            data = $("<td></td>").append(grid[i][j].but);
            row.append(data);

        }
        $('#cell-table').append(row);
    }
    while(curBomb < bombCount){
        for(var i = 0; i < size; ++i){
            for(var j = 0; j < size; ++j){
                if(grid[i][j].isBomb) continue;
                rand = Math.random();
                if(rand < difficulty && curBomb < bombCount){
                    grid[i][j].isBomb = true;
                    //grid[i][j].but.html("b");
                    curBomb++;
                }
            }
        }
    }
    for(var i = 0; i < size; ++i){
        for(var j = 0; j < size; ++j){
           grid[i][j].but.css("height","40px");
        }
    }
}

function lose(){
    stopTimer();
    uncover();
    curTime = 0;
    gameStarted = false;
    $('#start').prop("disabled", false);
    $('#lose').dialog({
        autoOpen: true,
        modal: true,
        buttons:[
            {
                text: "Ok",
                click: function() {
                    $('#cell-table').empty();
                    $( this ).dialog( "close" );
                }
            }
        ]
    });
}

function contextClick(i,j){
    return function(evt){
        evt.preventDefault();
        contextClickHelper(i,j);
        if(checkWin())
            win();
    }
}

function contextClickHelper(i,j){
    var cell = grid[i][j];
    if(cell.state == "normal" && bombCount > 0){
        cell.state = "flag";
        bombCount--;
        $('#bombs-left').html(bombCount);
        //cell.but.addClass("red"); //Debugging
        cell.but.empty();
        var flag = $('<img>').attr('src',"/public/images/flag.png").addClass("images").css("height",(cell.but.height()-3)+"px");
        console.log(cell.but.css("height"));
        cell.but.append(flag);
    }
    else if(cell.state == "flag"){
        cell.state = "question";
        bombCount++;
        $('#bombs-left').html(bombCount);
        cell.but.empty();
        var mine = $('<img>').attr('src',"/public/images/questionMark.jpg").addClass("images");
        cell.but.append(mine);
    }
    else if(cell.state == "question"){
        cell.state = "normal";
        cell.but.empty();
        cell.but.html("&nbsp;");
    }
}

function colorCell(button, n){
    if(n == 1){
        button.addClass("black");
    }
    else if(n == 2){
        button.addClass("blue");
    }
    else if(n == 3){
        button.addClass("red");
    }
    else if(n == 4){
        button.addClass("brown");
    }
    else if(n >= 5){
        button.addClass("purple");
    }
    button.prop("disabled", true);
}

function checkWin(){
    var allChecked = true;

    for(var i = 0; i < size; ++i){
        for(var j = 0; j < size; ++j){
            if(grid[i][j].isBomb === false && grid[i][j].state != "clicked"){
                allChecked = false;
            }
        }
    }

    if(!allChecked){
        if(bombCount != 0)
            return false;
        for(var i = 0; i < size; ++i){
            for(var j = 0; j < size; ++j){
                if(grid[i][j].isBomb === false && grid[i][j].state === "checked"){
                    return false;
                }
            }
        }
    }

    return true;
}

function win(){
    score = (difficulty*10*size * size * 5 - curTime) * size * (difficulty*10 + 1);
    if(cheated) score *= 0.01;
    $('input[name=score]').val(score);
    $('input[name=difficulty]').val(difficulty);
    console.log($('input[name=difficulty]').val());
    if($('input[name=difficulty]').val() == "0.1"){
        $('input[name=difficulty]').val("Easy");
    }
    else if($('input[name=difficulty]').val() == "0.25"){
        $('input[name=difficulty]').val("Medium");
    }
    else{
        $('input[name=difficulty]').val("Hard");
    }
    var str = "You scored a " + score + " on " + $('input[name=difficulty]').val() + ".\n";
    if(cheated) str+= "You lost a lot of points by cheating! Try not to do that next time\n";
    str+= "Would you like to play again?";
    $('#play-again').html(str);
    $('#play-again').dialog({
        autoOpen: true,
        modal: true,
        buttons:[
            {
                text: "Yes",
                click: function() {
                    $('input[name=continue]').val("true");
                    $( this ).dialog( "close" );
                    $('#submit-score').submit();
                }
            },
            {
                text: "No",
                click: function() {
                    $('input[name=continue]').val("false");
                    $(this).dialog("close");
                    $('#submit-score').submit();
                }
            }
        ]
    });
}

function toggleCheat(){
    if(cheating){
        cheating = false;
        for(var i = 0; i < size; ++i){
            for(var j = 0; j < size; ++j){
                if(grid[i][j].isBomb){
                    grid[i][j].but.html("&nbsp;");
                }
            }
        }
    }
    else{
        cheating = true;
        cheated = true;
        for(var i = 0; i < size; ++i){
            for(var j = 0; j < size; ++j){
                if(grid[i][j].isBomb){
                    grid[i][j].but.html("B");
                }
            }
        }
    }
}

function uncover(){
    for(var i = 0; i < size; ++i){
        for(var j = 0; j < size; ++j){
            grid[i][j].but.empty();
            if(grid[i][j].isBomb && grid[i][j].state != "flag"){
                grid[i][j].but.addClass("bombNotFlagged");
                var mine = $('<img>').attr('src',"/public/images/Pineco.png").addClass("images").css("height",(grid[i][j].but.height()-3)+"px");
                grid[i][j].but.append(mine);
            }
            else if(grid[i][j].isBomb && grid[i][j].state == "flag"){
                grid[i][j].but.addClass("bombFlagged");
                var mine = $('<img>').attr('src',"/public/images/Pineco.png").addClass("images").css("height",(grid[i][j].but.height()-3)+"px");
                grid[i][j].but.append(mine);
            }
            else if(!grid[i][j].isBomb && grid[i][j].state == "flag"){
                grid[i][j].but.addClass("spaceFlagged");
            }
            else{
                grid[i][j].but.addClass("bombFlagged");
            }

        }
    }
}
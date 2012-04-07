//(C) 2012 Anton Zemlyanov

//This module describes Betfair price
//see Sports API documentation on http://bdp.betfair.com

exports.BetfairPrice = BetfairPrice;

var epsilon=0.001;

function BetfairPrice(size) {
    if(!size)
        size = 1.01;

    this.setStake(size);
}

BetfairPrice.prototype.setStake = function(size) {
    if(!size)
        size = 1.01;
    if(typeof(size)==='string')
        size = parseFlost(size);

    if(size<1.01)
        size = 1.01;
    else if (size<2)
        size = Math.round(size*100.0)/100.0;
    else if (size<3)
        size = Math.round(size*50.0)/50.0;
    else if (size<4)
        size = Math.round(size*20.0)/20.0;
    else if (size<6)
        size = Math.round(size*10.0)/10.0;
    else if (size<10)
        size = Math.round(size*5.0)/5.0;
    else if (size<20)
        size = Math.round(size*2.0)/2.0;
    else if (size<30)
        size = Math.round(size*1.0)/1.0;
    else if (size<50)
        size = Math.round(size*0.5)/0.5;
    else if (size<100)
        size = Math.round(size*0.2)/0.2;
    else if (size<1000)
        size = Math.round(size*0.1)/0.1;
    else
        size = 1000.0;

    this.size = size;
    return;
}

BetfairPrice.prototype.toString = function(size) {
    return this.size.toFixed(2);
}

BetfairPrice.prototype.increasePrice = function() {
    var size = this.size;

    if(size<(2.0-epsilon))
        size += 0.01;
    else if(size<(3.0-epsilon))
        size += 0.02;
    else if(size<(4.0-epsilon))
        size += 0.05;
    else if(size<(6.0-epsilon))
        size += 0.1;
    else if(size<(10.0-epsilon))
        size += 0.2;
    else if(size<(20.0-epsilon))
        size += 0.5;
    else if(size<(30.0-epsilon))
        size += 1.0;
    else if(size<(50.0-epsilon))
        size += 2.0;
    else if(size<(100.0-epsilon))
        size += 5.0;
    else if(size<(1000.0-epsilon))
        size += 10.0;
    else 
        size = 1000.0;

    this.size = size;
    return this;
}

BetfairPrice.prototype.decreasePrice = function() {
    var size = this.size;

    if(size>(100.0+epsilon))
        size -= 10.0;
    else if(size>(50.0+epsilon))
        size -= 5.0;
    else if(size>(30.0+epsilon))
        size -= 2.0;
    else if(size>(20.0+epsilon))
        size -= 1.0;
    else if(size>(10.0+epsilon))
        size -= 0.5;
    else if(size>(6.0+epsilon))
        size -= 0.2;
    else if(size>(4.0+epsilon))
        size -= 0.1;
    else if(size>(3.0+epsilon))
        size -= 0.05;
    else if(size>(2.0+epsilon))
        size -= 0.02;
    else if(size>(1.01+epsilon))
        size -= 0.01;
    else 
        size = 1.01;

    this.size = size;
    return this;    
}

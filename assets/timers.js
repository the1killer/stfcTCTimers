// const moment = require('momentjs');
let STFCTimers;
STFCTimers = (function() {
    const init = function() {
        loadFile("./assets/systems.json",systemsLoaded);
    }

    let mformat = "dddd h a"
    var tieredsystems = {};
    let NOW = moment()

    let systemsLoaded = function(data) {
        console.log(data);
        processData(data);
    }

    let processData = function(data) {
        Object.keys(data).forEach(tier => {
            data[tier].forEach(sys =>{
                var time = moment().utc().day(sys.attackDay).hour(sys.attackHour).minute(0)
                var strtime = time.local().calendar();
                if(moment(time).add(15+(15*tier),"minutes").isBefore()) {
                    time.add(1,"week")
                    strtime = time.local().calendar(null,{sameElse:"[Next] dddd [at] h:mm a"})
                }
                let diff = time.local().diff(NOW,"minutes")
                sys.diff = diff
                sys.time = time;
                sys.strtime = strtime;
            })
        })
        STFCTimers.tieredsystems = data;
        renderLevels()    
    }

    let renderLevels = function() {
        Object.keys(STFCTimers.tieredsystems).forEach(tier => {
            $("#syslist").append(`
            <tbody id='t${tier}' class='tier'>
                <tr><th colspan='5'>Tier ${tier}</th></tr>
                <tr><th>Name</th><th>Direction</th><th>Next Attack</th><th>Power</th><th>Resource</th>
            </tbody>
            `);
            renderSystems(tier)
        });
    }

    let renderSystems = function(tier) {
        let systems = STFCTimers.tieredsystems[tier];
        systems.sort((a,b) => {
            if(a.time > b.time) {
                return 1
            } 
            return -1;
        })
        systems.forEach(sys =>{
            
            var time = sys.time;
            var strtime = sys.strtime;
            var diff = sys.diff;

            var color = null;
            if(diff < 5) {
                color = 'blinking'
            } else if(diff < 90) {
                color = 'red'
            } else if(diff < 60*4) {
                color = 'yellow'
            } else if(diff < 60*12) {
                color = 'green'
            } else if(diff < 60*24) {
                color = 'white'
            } else if(diff > 60*24*6) {
                color = 'darkgrey'
            }

            if(color != null) {
                color = " "+color;
            } else {
                color = "";
            }

            $("#t"+tier).append(`
            <tr id='sys-"${sys.name}"' class='sys'>
                <td>${sys.name}</td>
                <td>${sys.direction}</td>
                <td class="time"><span class="${color}">${strtime}</span></td>
                <td class="power">${sys.power || ""}</td>
                <td class="power">${sys.resource || ""}</td>
            </tr>`)
        })
    }

    return {
        init,
        tieredsystems
    }
})();

let loadFile = async function(file, callback) {
    $.getJSON(file, function() {
    }).done(function(d) {
        if(typeof callback === 'function') {
            callback(d);
        } else {
            return d;
        }
    }).fail(function(d, e, f) {
        console.warn(file + " had a problem loading. Sorry!");
        console.warn(d, e, f);
    }).always(function() {
    });
};
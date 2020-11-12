// const moment = require('momentjs');
let STFCTimers;
STFCTimers = (function() {
    const init = function() {
        loadFile("./systems.json",systemsLoaded);
    }

    let mformat = "dddd h a"
    var tieredsystems = {};

    let systemsLoaded = function(data) {
        console.log(data);
        STFCTimers.tieredsystems = data;
        renderLevels()
    }

    let renderLevels = function() {
        Object.keys(STFCTimers.tieredsystems).forEach(tier => {
            $("#syslist").append(`
            <tbody id='t${tier}' class='tier'>
                <tr><th colspan='4'>Tier ${tier}</th></tr>
            </tbody>
            `);
            renderSystems(tier)
        });
    }

    let renderSystems = function(tier) {
        let systems = STFCTimers.tieredsystems[tier];
        systems.forEach(sys =>{
            var time = moment().utc().day(sys.attackDay).hour(sys.attackHour).minute(0)
            if(moment(time).add(1,"hour").isBefore()) {
                time.add(1,"week")
            }
            $("#t"+tier).append(`
            <tr id='sys-"+sys.name+"' class='sys'>
                <td>${sys.name}</td>
                <td>${sys.direction}</td>
                <td class="time">${time.local().calendar()}</td>
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
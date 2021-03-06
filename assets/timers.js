// const moment = require('momentjs');

moment.fn.roundNext15Min = function () {
    var intervals = Math.floor(this.minutes() / 15);
    if(this.minutes() % 15 != 0)
        intervals++;
        if(intervals == 4) {
            this.add('hours', 1);
            intervals = 0;
        }
        this.minutes(intervals * 15);
        this.seconds(0);
        return this;
    }

const shortEnglishHumanizer = humanizeDuration.humanizer({
    language: "shortEn",
    languages: {
        shortEn: {
        y: () => "y",
        mo: () => "mo",
        w: () => "w",
        d: () => "d",
        h: () => "h",
        m: () => "m",
        s: () => "s",
        ms: () => "ms",
        },
    },
});

let STFCTimers;
STFCTimers = (function() {
    const init = function() {
        loadFile("./assets/systems.json",systemsLoaded);
    }

    let mformat = "dddd h a"
    var tieredsystems = {};
    let NOW = moment()

    let systemsLoaded = function(data) {
        // console.log(data);
        processData(data);

        var str = moment()._d.toString();
        str = str.match(/\(([\w\s]+)\)/)
        $('.timezone').text(`Times are in ${str[0]}`)
    }

    let processData = function(data) {
        Object.keys(data).forEach(tier => {
            data[tier].forEach(sys =>{
                var time = moment().utc().day(sys.attackDay).hour(sys.attackHour).minute(0)
                var strtime = time.local().calendar();
                if(moment(time).add(15+(15*tier),"minutes").isBefore()) {
                    time.add(1,"week")
                    let next = "[Next] dddd [at] h:mm a"
                    strtime = time.local().calendar(null,{nextWeek: next, sameElse: next})
                } else if(moment(time).local().diff(moment(),'hours') > 6*24) {
                    let next = "[Next] dddd [at] h:mm a"
                    strtime = time.local().calendar(null,{nextWeek: next, sameElse: next})
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
            var hide = location.hash.includes("hidet"+tier);
            $("#syslist").append(`
            <tbody id='t${tier}' class='tier'>
                <tr><th colspan='6' class='tierheader' onclick="STFCTimers.toggleTier(${tier})">Tier ${tier}</th></tr>
                <tr data-tier='${tier}' class='${hide ? "hide" : ""}'><th>Name</th><th>Dir</th><th colspan='2'>Next Attack</th><th>Power</th><th>Resource</th>
            </tbody>
            `);
            renderSystems(tier, hide)
        });
    }

    let renderSystems = function(tier, hide) {
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

            var find = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Today","Tomorrow"];
            var replace = ["Sun","Mon","Tues","Wed","Thur","Fri","Sat","<small class='today'>Today</small>","<small>Tomorrow</small>"];
            for(var i=0;i<find.length;i++) {
                strtime = strtime.replace(find[i],replace[i])
            }

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

            var duration = shortEnglishHumanizer(time.diff());
            duration = duration.replace(/[\s\t]+/g,'');
            var split = duration.split(',')
            if(split.length > 2) {
                duration = `${split[0]} ${split[1]}`
            }
            if(duration.includes("s")) {
                duration = `${split[0]}`
            }
            if(time.diff() < 0) {
                // duration = "<span class='red'>– "+duration+"</span>";
                duration = "<span class='red'>Now</span>";
            }

            $("#t"+tier).append(`
            <tr id='sys-${sys.name}' class='sys ${hide ? "hide" : ""}' data-tier='${tier}'>
                <td>${sys.name}</td>
                <td>${sys.direction}</td>
                <td class="time"><span class="${color}">${strtime}</span></td>
                <td class="duration">${duration}</td>
                <td class="power">${sys.power || ""}</td>
                <td class="resource">${sys.resource || ""}</td>
            </tr>`)
        })
        $("#t"+tier).append(`<tr class='bottompadd'><td></td></tr>`)
    }

    let toggleTier = function(num) {
        var eles = $('tr[data-tier='+num+']');
        if(eles[0].classList.contains("hide")) {
            eles.removeClass('hide');
            if(location.hash.includes("hidet"+num)) {
                location.hash = location.hash.replace(",hidet"+num,'');
            }
        } else {
            eles.addClass('hide');
            if(location.hash.includes("hidet"+num) == false) {
                location.hash += ",hidet"+num
            }
        }
    }

    return {
        init,
        tieredsystems,
        toggleTier
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
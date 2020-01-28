var song
var songButton
var songhist = []
var amp
var x,y,r,i=0
var rate=1

var sqButton 
var wave
var playing = false
var slider,slider2

var binss = 16
var spectrum
var spektrum
var spektrum2

function preload(){
    song = loadSound('hardbass2.mp3')
}

function setup(){
    createCanvas(700,580)
    background(0)

    songButton = createButton("play")
    songButton.mousePressed(togglePlay)

    sqButton = createButton("sine")
    sqButton.mousePressed(togglePlay.bind(null,"sine"))
    slider = createSlider(0,20000,440)
    slider2 = createSlider(0,1024,440)

    amp = new p5.Amplitude()
    fft = new p5.FFT(0.9,binss)
    wave = new p5.Oscillator()
    angleMode(DEGREES)

}

function togglePlay(msg){    
    
    if(msg=='sine'){
        if(playing){
            wave.stop()
            text("STOPPED",200,200)
            playing = false
        }
        else{
            wave.setType(msg)    
            wave.freq(slider.value())
            wave.amp(0.5)
            wave.start()
            playing = true
        }
    }
    else
    {
        if(song.isPlaying()){
            song.pause()
            songButton.html('play')
        }
        else{
            song.setVolume(0.5)
            song.play()
            song.rate(rate)
            songButton.html('pause')
        }
    }
    
    
}

function draw(){
    background(0)
    
    fill(255)
    wave.freq(slider.value())
    text(slider.value(),50,50)
    text(slider2.value(),100,100)

    spectrum = fft.analyze()
    spektrum = smoothed_z_score(spectrum)
    spektrum2 = smoothed_z_score(spektrum)
   
    beginShape()
    for(var i=0;i<binss;i++)
    {        
        var f = map(i,0,binss,1,23400)
        
        var y=300
        stroke(255)
        noFill()
        
        if(abs(spektrum[i])>0) y = map(spectrum[i],0,225,300,155),console.log('WOW')
        var x = map(i,0,binss,0,width)
        vertex(x,y)
    }
    endShape()

}

function sum(a) {
    return a.reduce((acc, val) => acc + val)
}

function mean(a) {
    return sum(a) / a.length
}

function stddev(arr) {
    const arr_mean = mean(arr)
    const r = function(acc, val) {
        return acc + ((val - arr_mean) * (val - arr_mean))
    }
    return Math.sqrt(arr.reduce(r, 0.0) / arr.length)
}

function smoothed_z_score(y, params) {
    var p = params || {}
    // init cooefficients
    const lag = p.lag || 5
    const threshold = p.threshold || 3.5
    const influence = p.influece || 0.5

    if (y === undefined || y.length < lag + 2) {
        throw ` ## y data array to short(${y.length}) for given lag of ${lag}`
    }
    //console.log(`lag, threshold, influence: ${lag}, ${threshold}, ${influence}`)

    // init variables
    var signals = Array(y.length).fill(0)
    var filteredY = y.slice(0)
    const lead_in = y.slice(0, lag)
    //console.log("1: " + lead_in.toString())

    var avgFilter = []
    avgFilter[lag - 1] = mean(lead_in)
    var stdFilter = []
    stdFilter[lag - 1] = stddev(lead_in)
    //console.log("2: " + stdFilter.toString())

    for (var i = lag; i < y.length; i++) {
        //console.log(`${y[i]}, ${avgFilter[i-1]}, ${threshold}, ${stdFilter[i-1]}`)
        if (Math.abs(y[i] - avgFilter[i - 1]) > (threshold * stdFilter[i - 1])) {
            if (y[i] > avgFilter[i - 1]) {
                signals[i] = +1 // positive signal
            } else {
                signals[i] = -1 // negative signal
            }
            // make influence lower
            filteredY[i] = influence * y[i] + (1 - influence) * filteredY[i - 1]
        } else {
            signals[i] = 0 // no signal
            filteredY[i] = y[i]
        }

        // adjust the filters
        const y_lag = filteredY.slice(i - lag, i)
        avgFilter[i] = mean(y_lag)
        stdFilter[i] = stddev(y_lag)
    }

    return signals
}

//var y=[0,0,0,0,1,2,0,0,0]
//var res = smoothed_z_score(y,null)
//console.log(res)

//module.exports = smoothed_z_score

//export {sum as s,mean as m,stddev as st,smoothed_z_score as sm}
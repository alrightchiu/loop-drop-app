var Observ = require('@mmckegg/mutant/value')

module.exports = function(audioContext, input) {

  var output = audioContext.createGain()
  var analyser = audioContext.createAnalyser()
  analyser.fftSize = 128
  analyser.minDecibels = -120
  analyser.maxDecibels = -50
  analyser.smoothingTimeConstant = 0.1
  output.connect(analyser)

  var yank = audioContext.createGain()
  input.connect(yank)

  var fft = new Uint8Array(analyser.frequencyBinCount)
  var waiting = false

  output.active = Observ(false)

  output.trigger = function() {
    if (!waiting) {
      yank.connect(output)
      waiting = true
      output.active.set(true)
      setTimeout(function() {
        var stopWaiting = setInterval(function() {
          analyser.getByteFrequencyData(fft)
          var sum = 0
          for (var i=0;i<fft.length;i++) {
            sum += fft[i]
          }

          if (sum === 0) {
            clearInterval(stopWaiting)
            yank.disconnect()
            output.active.set(false)
            waiting = false
          }

        }, 1000)
      }, 5000)
    }
  }

  output.destroy = function () {
    yank.disconnect()
  }

  return output
}

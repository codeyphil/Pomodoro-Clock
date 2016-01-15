var PomodoroViewModel = function(options) {
    var self = this;

    var secondCounter = 60;
    var counter = 0;
    var running = false;
    var minuteCounter = $('#count').html();
    var barStart = 0;
    var pauseBarStart = 0;

    self.counterActions = {
        pause : function() {
            running = false;
            clearInterval(counter);
            if ($('#startClock').hasClass("breaking")) {
                pauseBarStart = 0;
            }
            if ($('#count').html() === $('#break-length').html() && $('#startClock').hasClass("breaking")) {
                self.counterActions.stop();
            }
        },
        newCounter : function () {
            running = false;
            clearInterval(counter);
            if ($('#startClock').hasClass("breaking")) {
                barStart = 0;
                $('#startClock').removeClass("breaking");
            }
            if ($('#count').html() === $('#session-length').html()) {
                self.counterActions.count();
            }
        },
        count : function() {
            running = true;
            $('#click-start').remove();
            counter = setInterval(function() {
                self.animations.barAnimation();
            }, 1000);
            if ($('#count').html() === $('#session-length').html()) {
                $('.progress-bar-striped').css("width", "0%").attr("aria-valuenow", barStart);
                minuteCounter = $('#count').html();
                minuteCounter--;
                secondCounter = 60;
            }
        },
        stop: function() {
            running = true;
            counter = setInterval(function() {
                self.animations.breakAnimation();
            }, 1000);
            if ($('#count').html() === $('#break-length').html()) {
                $('.progress-bar-striped').css("width", "0%").attr("aria-valuenow", 0);
                minuteCounter = $('#count').html();
                minuteCounter--;
                secondCounter = 60;
            }
        },
        reset: function() {
            if (running) {
                barStart = 0;
                pauseBarStart = 0;
                $('.progress-bar-striped').css("width", "0%");
            }
            if (running === false) {
                barStart = 0;
                pauseBarStart = 0;
                $('.progress-bar-striped').css("width", "0%");
            }
            var currentSession = $('#session-length').html();
            $('#count').html(currentSession);
            $('.progress-bar').attr('style', 'width: 0%');
            self.counterActions.pause();
        },
        setDefault: function() {
            $('#session-length').text(25);
            $('#break-length').text(5);
            $('#count').text(25);
            barStart = 0;
            pauseBarStart = 0;
            $('.progress-bar-striped').css("width", "0%");
        },
        setSession : function(num) {
            $('#count').html(num);
            $('#session-length').html(num);
        },
        setBreak : function(v) {
            $('#break-length').html(v);
        }
    }

    self.animations = {
        barAnimation : function() {
            var lengthReference = $('#session-length').html();
            var progressMax = Number(lengthReference) * 60;
            var progressIncrease = (1 / progressMax) * 100;
            secondCounter--;
            barStart += progressIncrease;
            $('.progress-bar').css("width", barStart + "%").attr("aria-valuenow", barStart);
            $('.progress-bar-striped').attr("aria-valuemax", progressMax);
            $('#count').text(minuteCounter + ":" + secondCounter);
            if (secondCounter < 10) {
                $('#count').text(minuteCounter + ":0" + secondCounter);
            }
            if (secondCounter === 0) {
                minuteCounter--;
                secondCounter = 59;
            }
            if (minuteCounter < 0) {
                $('.progress-bar-striped').css("width", "100%");
                var setBreak = $('#break-length').html();
                $('#count').html(setBreak);
                $('#session-time-title').html("Break!").fadeOut(500).fadeIn(500);
                $('#startClock').addClass("breaking");
                self.counterActions.pause();
            }
        },
        breakAnimation: function() {
            var lengthReference = $('#break-length').html();
            var progressMax = Number(lengthReference) * 60;
            var progressIncrease = (1 / progressMax) * 100;
            pauseBarStart += progressIncrease;
            secondCounter--;
            $('.progress-bar').css("width", pauseBarStart + "%").attr("aria-valuenow", pauseBarStart);
            $('.progress-bar-striped').attr("aria-valuemax", progressMax);
            $('#count').text(minuteCounter + ":" + secondCounter);
            if (secondCounter < 10) {
                $('#count').text(minuteCounter + ":0" + secondCounter);
            }
            if (secondCounter === 0) {
                minuteCounter--;
                secondCounter = 59;
            }
            if (minuteCounter < 0) {
                var restartSession = $('#session-length').html();
                $('#count').html(restartSession);
                $('#session-time-title').html("Launch");
                self.counterActions.newCounter();
            }
        }
    }

    self.init = function() {
        $('#startClock').on('click', function() {
            var me = $(this);
            me.removeClass("breaking");
            if (running) {
                self.counterActions.pause();
            } else {
                self.counterActions.count();
            }
        });

        $('.add-minute').on('click', function() {
            $('#session-length').html(function(i, val) {
                return val * 1 + 1;
            });

            if (!running) {
                $('#count').html(function(i, val) {
                    return val * 1 + 1;
                });
            }
        });

        $('.subtract-minute').on('click', function() {
            $('#session-length').html(function (i, val) {
                var result = val * 1 - 1;

                if (val <= 1) {
                    return 1;
                }

                return val * 1 - 1;
            });

            if (!running) {
                $('#count').html(function(i, val) {
                    var result = val * 1 - 1;

                    if (val <= 1) {
                        return 1;
                    }

                    return val * 1 - 1;
                });
            }
        });

        $('#more-break').on('click', function (e) {
            if (e) {
                e.preventDefault();
            }

            $('#break-length').html(function(i, val) {
                return val * 1 + 1;
            });
        });

        $('#less-break').on('click', function (e) {
            if (e) {
                e.preventDefault();
            }

            $('#break-length').html(function (i, b) {
                var result = b * 1 - 1;

                if (b <= 1) {
                    return 1;
                }

                return b * 1 - 1;
            });
        });


        $('[data-action=session]').on('click', function (e) {
            if (e) {
                e.preventDefault();
            }
            self.counterActions.setSession($(this).data('value'));
        });

        $('[data-action=break]').on('click', function (e) {
            if (e) {
                e.preventDefault();
            }
            self.counterActions.setBreak($(this).data('value'));
        });

        $('#reset-button').on('click', self.counterActions.reset);
        $('#reset-defaults').on('click', self.counterActions.setDefault);


        $('[data-action=locallyStored]').on('click', function(e) {
            if (e) {
                e.preventDefault();
            }

            var me = $(this);

            if (me.data('save')) {
                $('#saveAlert').css("padding", "1em");
                localStorage.currentSave = $('#session-length').html();
                localStorage.currentBreak = $('#break-length').html();
                $('#saveAlert').html("Cool! You will have a launch length of <u>" + localStorage.currentSave + "</u> minute(s), and a break length of <u>" + localStorage.currentBreak + "</u> minute(s) the next time you load your settings!").show().fadeOut(10500);
            } else if (localStorage.getItem('currentSave') === null) {
                $('#saveAlert').css("padding", "1em");
                $('#saveAlert').html("Woah, it doesn't look like you have any saved settings. Save some settings to gain the ability to load them and/or delete them.").show().fadeOut(8500);
            } else if (me.data('load')) {
                $('#saveAlert').css("padding", "1em");
                $('#session-length').html(localStorage.currentSave);
                $('#break-length').html(localStorage.currentBreak);
                $('#count').html(localStorage.currentSave);
                $('#saveAlert').html("Awesome! You have reloaded your previously saved settings!").show().fadeOut(10000);
            } else {
                delete localStorage['currentSave'];
                delete localStorage['currentBreak'];
                $('#deleteAlert').html("Your saved settings have been successfully deleted.").show().fadeOut(7500);
            }
        });
    }
}
var lastupdate = 0;

function formatState(state, time) {
    var dateStr = dateFormat(new Date(parseInt(time) * 1000), "mmm dS, yyyy, h:MM TT");
    return "Last updated: " + dateStr;
}

function click(name) {
    $.ajax({
        url: "clk",
        data: {'id': name}
    })
}

function init() {
    $.ajax({
        url: "cfg",
        success: function (data) {
            var doorlist = $("#doorlist");

            for (var i = 0; i < data.length; i++) {
                var id = data[i][0];
                var name = data[i][1];
                var state = data[i][2];
                var time = data[i][3];
                var li = '<li id="' + id + '" data-icon="false">';
                li = li + '<a href="javascript:click(\'' + id + '\');">';
                li = li + '<img src="img/' + state + '.png" />';
                li = li + '<h3>' + name + '</h3>';
                li = li + '<p>' + formatState(state, time) + '</p>';
                li = li + '</a></li>';

                doorlist.append(li);
                doorlist.listview('refresh');
            }
        }
    });

    poll();
    pollCamera();
}

function poll() {
    $.ajax({
        url: "upd",
        data: {
            'lastupdate': lastupdate
        },
        success: function (response, status) {
            lastupdate = response.timestamp;

            for (var i = 0; i < response.update.length; i++) {
                var id = response.update[i][0];
                var state = response.update[i][1];
                var time = response.update[i][2];

                $("#" + id + " p").html(formatState(state, time));
                $("#" + id + " img").attr("src", "img/" + state + ".png");
                $("#doorlist").listview('refresh');
            }

            setTimeout('poll()', 1000);
        },
        // handle error
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            // try again in 10 seconds if there was a request error
            setTimeout('poll();', 10000);
        },
        //complete: poll,
        dataType: "json",
        timeout: 30000
    });
}

function pollCamera() {
    if (!pollCamera.timestamp) pollCamera.timestamp = $("#timestamp");
    if (!pollCamera.image) pollCamera.image = $("#camera-image");

    $.ajax({
        url: "cam",
        dataType: "json",
        success: function (response, status) {
            pollCamera.image.attr("src", "img/camera.jpg" + "?" + new Date().getTime());
            pollCamera.timestamp.text(response.last_timestamp);

            setTimeout('pollCamera()', 30000);
        },
        // handle error
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            setTimeout('pollCamera()', 30000);
        }
    });
}

$(document).live('pageinit', init);

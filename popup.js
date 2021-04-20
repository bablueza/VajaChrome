//importClass(clientPack.ClientVajaTTS);
$(document).ready(function () {
  $("#startspeak").click(function () {
    StartSpeak();
  });

  $("#stopspeak").click(function () {
    StopSpeak();
  });

  //     $('#speed').barrating('show', {
  //                     showValues:true,
  //                     showSelectedRating:false
  //                 });
});

function StopSpeak() {
  $("#status").html("<br>");
}


function StartSpeak() {
  $("#status").html("<img src=\"ajax-loader.gif\" style=\"width:20px; height:15px; border:0px;\">");
  chrome.tabs.executeScript({
    code: "window.getSelection().toString();"
  }, function (selection) {
    if (selection[0] == "") {
      $("#status").html("<font color=\"red\">ไม่พบข้อความที่ต้องการอ่าน</font>");
    } else {
      $.ajax(
        {
          // type: "GET",
          type: "POST",
          contentType: 'application/x-www-form-urlencoded; charset=utf-8',
          dataType: 'json',
          url: "http://203.185.132.220:9980/tts",
          data: { name:"blue",key:"1234567890",text: "" + selection,speed:$("#speed").val()}
        })
        .success(function (response) {
          var wav = response.result;
          var audio = new Audio(wav);
          $("#status").html("<audio controls autoplay='true' preload><source src=\"" + audio.src + "\" type=\"audio/wav\">Your browser does not support the audio element.</audio>");
        })
        .error(function (jqXhr, textStatus, errorThrown ) {
          $("#status").html("<font color=\"red\">ผิดพลาดกรุณาลองใหม่ภายหลัง ...</font><br>"+textStatus+":"+errorThrown);
        });

    }//end else
  });
}
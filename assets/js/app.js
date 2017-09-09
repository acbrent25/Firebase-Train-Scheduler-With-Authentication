$(document).ready(function() {

  // Initialize Firebase
    var config = {
        apiKey: "AIzaSyClg_9CBuyBx1zfG00NvXisqPkV1sSybZ4",
        authDomain: "my-first-project-4101a.firebaseapp.com",
        databaseURL: "https://my-first-project-4101a.firebaseio.com",
        projectId: "my-first-project-4101a",
        storageBucket: "my-first-project-4101a.appspot.com",
        messagingSenderId: "942795942547"
    };
    
    firebase.initializeApp(config);

    var database = firebase.database();

    // User enters name
        var trainName = "";
    // User enters Destination
        var trainDestination = "";
    // User enters train Time
        var trainTime = 0;
    // User enters frequency to determine time to destination
        var trainFrequency = 0;
        var minAway = 0;
        var key;
        var nextTrainCoverted = 0;
        var tMinutesTillTrain = 0;
 
    // Capture Train Submit Button Click
    $('#submit').on('click', function(){
        event.preventDefault();

        // store and retrieve the most recent train
        trainName = $('#train-name').val().trim().toProperCase();
        trainDestination = $('#train-destination').val().trim().toProperCase();
        trainTime = $('#train-time').val().trim();
        trainFrequency = $('#train-frequency').val().trim();

        // First Time (pushed back 1 year to make sure it comes before current time)
        var firstTimeConverted = moment(trainTime, "hh:mm").subtract(1, "years");
        console.log("firstTimeConverted: " + firstTimeConverted);

        // Current Time
        var currentTime = moment();
        console.log("CURRENT TIME: " + moment(currentTime).format("hh:mm"));

        // Difference between the times
        var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
        console.log("DIFFERENCE IN TIME: " + diffTime);

        // Time apart (remainder)
        var tRemainder = diffTime % trainFrequency;
        console.log("Remainder: " + tRemainder);

        // Minute Until Train
        var tMinutesTillTrain = trainFrequency - tRemainder;
        console.log("MINUTES TILL TRAIN: " + tMinutesTillTrain);

        // Next Train
        var nextTrain = moment().add(tMinutesTillTrain, "minutes");
        console.log("ARRIVAL TIME: " + moment(nextTrain).format("hh:mm"));

        var nextTrainCoverted = moment(nextTrain).format("hh:mm");
        console.log('next train converted: ' + nextTrainCoverted);

        database.ref().push({
            trainName: trainName,
            trainDestination: trainDestination,
            trainTime: trainTime,
            trainFrequency: trainFrequency,
            nextTrainCoverted: nextTrainCoverted,
            tMinutesTillTrain: tMinutesTillTrain,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
        }); // database set

    }); // submit on click


    function printToPage() {
        $('#train-schedule-area').empty();
        
        database.ref().on("child_added", function(childSnapshot) {
            // 
            var key = childSnapshot.key;
            console.log(key);
            // childData will be the actual contents of the child
            var childData = childSnapshot.val();
            console.log(childData);

            console.log("train dest: " + childData.trainDestination);
            console.log("train name: " + childData.trainName);
            console.log("train time: " + childData.trainTime);
            console.log("train Frequency: " + childData.trainFrequency);
            console.log("nextTrainCoverted: " + childData.nextTrainCoverted);

            var newTrain = $('<tr>');
            var childName = $("<td>").text(childData.trainName);
            var childDestination = $("<td>").text(childData.trainDestination);
            var childFrequency = $("<td>").text(childData.trainFrequency + " min");
            var childTime = $("<td>").text(childData.nextTrainCoverted);
            var minAway = $("<td>").text(childData.tMinutesTillTrain);
            var close = $("<td>").html('<i class="fa fa-window-close" aria-hidden="true"></i>');
            close.addClass('close-btn');
            close.attr('data-train', key);
            
            newTrain.append(childName).append(childDestination).append(childFrequency).append(childTime).append(minAway).append(close);

            $('#train-schedule-area').append(newTrain);

        // Handle the errors
        }, function(errorObject) {
        console.log("Errors handled: " + errorObject.code);
        });

    }// print to page
    printToPage();

        // click the x button and delete the train
        $('body').on('click', '.close-btn', function(){
            var dataTrain = $(this).attr('data-train');
            console.log("dataTrain: " + dataTrain);
            database.ref(dataTrain).remove();
            $(this).remove();
            printToPage();
        });

        // convert string to captialize first letters
        String.prototype.toProperCase = function () {
            return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        };

}); // document ready 
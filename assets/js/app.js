
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
    var ref = firebase.database().ref;

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
        var firstTimeConverted;
        var currentTime;
        var diffTime;
        var tRemainder;
        var tMinutesTillTrain;
        var nextTrain;
        var nextTrainCoverted;

    // Capture Train Submit Button Click
    $('#submit').on('click', function(){
        event.preventDefault();
        
        // store and retrieve the most recent train
        trainName = $('#train-name').val().trim().toProperCase();
        trainDestination = $('#train-destination').val().trim().toProperCase();
        trainTime = $('#train-time').val().trim();
        trainFrequency = $('#train-frequency').val().trim();

        firstTimeConverted = moment(trainTime, "hh:mm").subtract(1, "years");
        console.log("firstTimeConverted: " + firstTimeConverted);
        
        // Current Time
        currentTime = moment();
        console.log("CURRENT TIME: " + moment(currentTime).format("hh:mm"));
        
        // Difference between current time and first time entered
        diffTime = moment().diff(moment(firstTimeConverted), "minutes");
        console.log("DIFFERENCE IN TIME: " + diffTime);
   
        // Time apart (remainder)
        tRemainder = diffTime % trainFrequency;
        console.log("Remainder: " + tRemainder);
   
        // Minute Until Train
        tMinutesTillTrain = trainFrequency - tRemainder;
        console.log("MINUTES TILL TRAIN: " + tMinutesTillTrain);
   
        // Next Train
        nextTrain = moment().add(tMinutesTillTrain, "minutes");
        console.log("ARRIVAL TIME: " + moment(nextTrain).format("hh:mm"));
   
        nextTrainCoverted = moment(nextTrain).format("hh:mm");
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
            console.log("childData: " + childData);

            console.log("train dest: " + childData.trainDestination);
            console.log("train name: " + childData.trainName);
            console.log("train time: " + childData.trainTime);
            console.log("train Frequency: " + childData.trainFrequency);
            console.log("nextTrainCoverted: " + childData.nextTrainCoverted);
            
            // Train Data to Put on Page
            var newTrain = $('<tr>');
            var childName = $("<td>").text(childData.trainName);
            var childDestination = $("<td>").text(childData.trainDestination);
            var childFrequency = $("<td>").text(childData.trainFrequency + " min");
            var childTime = $("<td>").text(childData.nextTrainCoverted);
            var minAway = $("<td>").text(childData.tMinutesTillTrain);
            
            // Edit Button Plus Attributes
            var edit = $("<td>").html('<i class="fa fa-pencil-square" aria-hidden="true"></i>');
            edit.addClass('edit-btn');
            edit.attr('data-train-name', childData.trainName);
            edit.attr('data-train-time', childData.trainTime);
            edit.attr('data-train-destination', childData.trainDestination);
            edit.attr('data-train-frequency', childData.trainFrequency);
            edit.attr('data-train-next', childData.nextTrainCoverted);
            edit.attr('data-train-minsAway', childData.tMinutesTillTrain);
            edit.attr('edit-data-train', key);
            edit.attr('data-toggle', "modal");
            edit.attr('data-target', "#editModal");
                             
            // Close Button Plus Attributes
            var close = $("<td>").html('<i class="fa fa-window-close" aria-hidden="true"></i>');
            close.addClass('close-btn');
            close.attr('data-train', key);
            
            newTrain.append(childName).append(childDestination).append(childFrequency).append(childTime).append(minAway).append(edit).append(close);

            $('#train-schedule-area').append(newTrain);

        // Handle the errors
        }, function(errorObject) {
        console.log("Errors handled: " + errorObject.code);
        });

    }// print to page
    printToPage();

        // click the x button and delete the train
        $('body').on('click', '.close-btn', function(){
            var dataTrain = $(this).attr('edit-data-train', key);
            database.ref(dataTrain).remove();
            $(this).remove();
            printToPage();
    });

        // click the edit button 
        $('body').on('click','.edit-btn', function(){
            var editDataTrain = $(this).attr('edit-data-train');
            var editTrainDestination = $(this).attr('data-train-destination');
            var editTrainFrequency = $(this).attr('data-train-frequency');
            var editTrainTime = $(this).attr('data-train-time');

            $('#modal-submit').attr('data-train-key', editDataTrain);
            $('#modal-submit').attr('data-train-destination', editTrainDestination);
            $('#modal-submit').attr('data-train-frequency', editTrainFrequency);
            $('#modal-submit').attr('data-train-time', editTrainTime); 
        });



        // Submitting the modal 
        $('#modal-submit').on('click', function(){
            event.preventDefault();

            trainName = $('#edit-train-name').val().trim().toProperCase();
            trainDestination = $('#edit-train-destination').val().trim().toProperCase();
            trainTime = $('#edit-train-time').val().trim();
            trainFrequency = $('#edit-train-frequency').val().trim();

            $('#editModal').modal('hide');

            var editDataTrain = $(this).attr('data-train-key');
            var editTrainDestination = $(this).attr('data-train-destination');
            var editTrainFrequency = $(this).attr('data-train-frequency');

            // For Updating Time
            firstTimeConverted = moment(trainTime, "hh:mm").subtract(1, "years");
            currentTime = moment();
            diffTime = moment().diff(moment(firstTimeConverted), "minutes");
            tRemainder = diffTime % trainFrequency;
            tMinutesTillTrain = trainFrequency - tRemainder;
            nextTrain = moment().add(tMinutesTillTrain, "minutes");
            nextTrainCoverted = moment(nextTrain).format("hh:mm");
            
            
            
            firebase.database().ref().child(editDataTrain)
            .update({ 
                trainName: trainName,
                trainDestination: trainDestination,
                trainFrequency: trainFrequency,
                nextTrainCoverted: nextTrainCoverted,
                tMinutesTillTrain: tMinutesTillTrain,
             });
            
            printToPage();

        });

        // convert string to captialize first letters
        String.prototype.toProperCase = function () {
            return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        };

}); // document ready 
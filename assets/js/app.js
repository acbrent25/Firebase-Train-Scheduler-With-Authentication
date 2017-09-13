$(document).ready(function() {
    
       // Initialize Time Picker
       $('input.timepicker').timepicker({
           timeFormat: 'H:mm',
           interval: 5,
       });
       
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
    
       var trainName = "";
       var trainDestination = "";
       var trainTime = 0;
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
    
           updatTime();
            
           database.ref().push({
           trainName: trainName,
           trainDestination: trainDestination,
           trainTime: trainTime,
           trainFrequency: trainFrequency,
           nextTrainCoverted: nextTrainCoverted,
           tMinutesTillTrain: tMinutesTillTrain,
           dateAdded: firebase.database.ServerValue.TIMESTAMP
           }); // database set

           // Clear Form
           $('#train-name').val('');
           $('#train-destination').val('');
           $('#train-time').val('');
           $('#train-frequency').val('');  
    
       }); // submit on click
    
       // UPDATE TIME FUNCTION
    
       function printToPage() {
           $('#train-schedule-area').empty();

           
            
           database.ref().on("child_added", function(childSnapshot) {
               // 
               var key = childSnapshot.key;
               console.log(key);
               // childData will be the actual contents of the child
               var childData = childSnapshot.val();
              
               // Train Data to Put on Page
               var newTrain = $('<tr>');
               var childName = $("<td>").text(childData.trainName);
               var childDestination = $("<td>").text(childData.trainDestination);
               var childFrequency = $("<td>").text(childData.trainFrequency + " min");
               var childTime = $("<td>").text(childData.nextTrainCoverted);
               var minAway = $("<td>").text(childData.tMinutesTillTrain);
               $('td.edit-btn').attr('id', 'mins-away');
                
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
           var dataTrain = $(this).attr('data-train');
           database.ref(dataTrain).remove();
           $(this).remove();
           printToPage();
       });
    
       // click the edit button 
       $('body').on('click','.edit-btn', function(){
           var editTrainName = $(this).attr('data-train-name')
           var editDataTrain = $(this).attr('edit-data-train');
           var editTrainDestination = $(this).attr('data-train-destination');
           var editTrainFrequency = $(this).attr('data-train-frequency');
           var editTrainTime = $(this).attr('data-train-time');
    
           $('#modal-submit').attr('data-train-key', editDataTrain);
           $('#edit-train-name').attr('placeholder', editTrainName);
           $('#modal-submit').attr('data-train-destination', editTrainDestination);
           $('#edit-train-destination').attr('placeholder', editTrainDestination);
           $('#modal-submit').attr('data-train-frequency', editTrainFrequency);
           $('#edit-train-frequency').attr('placeholder', editTrainFrequency);
           $('#edit-train-time').attr('placeholder', editTrainTime);
           $('#modal-submit').attr('data-train-time', editTrainTime);
       });
    
    
    
       // SUBMITTING THE MODAL
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
    
           updatTime();

           $('#edit-train-name').val('');
           $('#edit-train-destination').val('');
           $('#edit-train-time').val('');
           $('#edit-train-frequency').val('');
    
                        
           firebase.database().ref().child(editDataTrain)
           .update({ 
               trainName: trainName,
               trainTime: trainTime,
               trainDestination: trainDestination,
               trainFrequency: trainFrequency,
               nextTrainCoverted: nextTrainCoverted,
               tMinutesTillTrain: tMinutesTillTrain

               });
            
           printToPage();
             
    
       });
    
       function updatTime() {
           // For Updating Time
           firstTimeConverted = moment(trainTime, "hh:mm").subtract(1, "years");
           currentTime = moment();
           diffTime = moment().diff(moment(firstTimeConverted), "minutes");
           tRemainder = diffTime % trainFrequency;
           tMinutesTillTrain = trainFrequency - tRemainder;
           nextTrain = moment().add(tMinutesTillTrain, "minutes");
           nextTrainCoverted = moment(nextTrain).format("hh:mm");
    
       }
    
       // convert string to captialize first letters
       String.prototype.toProperCase = function () {
           return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
       };
    
   }); // document ready 
$(document).ready( function() {
       var panels = $('.user-infos');
        var panelsButton = $('.dropdown-user');
        panels.hide();

          //Click dropdown
          panelsButton.click(function() {
              //get data-for attribute
              var dataFor = $(this).attr('data-for');
              var idFor = $(dataFor);

              //current button
              var currentButton = $(this);
              idFor.slideToggle(400, function() {
                  //Completed slidetoggle
                  if(idFor.is(':visible'))
                  {
                      currentButton.html('<i class="glyphicon glyphicon-chevron-up text-muted"></i>');
                  }
                  else
                  {
                      currentButton.html('<i class="glyphicon glyphicon-chevron-down text-muted"></i>');
                  }
              });
          });



              $('[id^=mycarousel]').carousel({
              interval:   4000
          });
            
            var clickEvent = false;
           $('[id^=mycarousel]').on('click', '.nav a', function() {
                clickEvent = true;
                $('.nav li').removeClass('active');
                $(this).parent().addClass('active');    
            }).on('slid.bs.carousel', function(e) {
              if(!clickEvent) {
                var count = $('.nav').children().length -1;
                var current = $('.nav li.active');
                current.removeClass('active').next().addClass('active');
                var id = parseInt(current.data('slide-to'));
                if(count == id) {
                  $('.nav li').first().addClass('active');  
                }
              }
              clickEvent = false;
            });
          });

          $('#openBtn').click(function(){
              $('#myModal').modal({show:true})
          });

         var city;
         var role;
         var lang;
          $('#form_artists').submit(function(event){
              
              //if ( $( '#AllIndia' ).prop( "checked" ) ) {
                //var city=null;

                  
                  $('input:checkbox[name=city]:checked').each(function() {
                              
                      // this.value = null;   
                      //var city=null;
                      if ( $( '#AllIndia' ).prop( "checked" ) ) {

                          this.value = $( ".citycheck" ).map(function() {
                            if(this.value != "AllIndia") {
                              return this.value;
                            } else {
                              return null;
                            }
                          }).get().join();
                      }   
                       
                       //this.value = city;
                       //alert("city is " + city);
                       if(this.value != null) {
                        city = this.value;
                       } return false;

                  });


                 $('input:checkbox[name=lang]:checked').each(function() {
                              
                      if ( $( '#AllLanguage' ).prop( "checked" ) ) {
                          //this.value = null;
                          this.value = $( ".langcheck" ).map(function() {
                            if(this.value != "AllLanguage") {
                              return this.value;
                            }
                            }).get().join();
                       }   
                       if(this.value != null) {
                        lang = this.value;
                        return false;
                       } 
                  });

                  $('input:checkbox[name=role]:checked').each(function() {
                              
                      if ( $( '#AllArtists' ).prop( "checked" ) ) {
                          //this.value = null;
                          this.value = $( ".artistscheck" ).map(function() {
                            if(this.value != "AllArtists") {
                              return this.value;
                            } 
                            }).get().join();
                       }  
                       if(this.value != null) {
                        role = this.value;
                        return false; 
                       } 
                  });



           

                // this = $('.citycheck');
                // alert($('checkbox').value);
                // alert("hello");
                // this.value = $( ".citycheck" ).map(function() {
                //   if(this.value != "AllIndia") {
                //     alert(this);
                //     alert(this.value);
                //     return this.value;
                //   }
                //   }).get().join();
               //} 

               

              // $('input:checkbox[name=city]').each(function() 
              //     {    
              //     if ( $( '#AllIndia' ).prop( "checked" ) ) {
              //         this.value = null;
              //         alert("hello");
              //         this.value = $( ".citycheck" ).map(function() {
              //           if(this.value != "AllIndia") {
              //             alert(this);
              //             alert(this.value);
              //             return this.value;
              //           }
              //           }).get().join();
              //      }
                   
              //   });
                
              //}

              
              //$('#AllIndia').checked
          });

          // $('#AllIndia').click(function() {
          //   this.value = null;
          //     // $('.citycheck').each(function() { //loop through each checkbox
          //     //     this.checked = true;  //select all checkboxes with class "checkbox1"              
          //     // });
          //     alert("here");

          //     this.value = $( ".citycheck" ).map(function() {
          //       if(this.value != "AllIndia")
          //       return this.value;
          //       })
          //       .get()
          //       .join();
              
          // }); 

          $(document).ready(function(){
            $('[id=searchartists]').on("keyup", function(){
              
                        
                        var rex = new RegExp($(this).val(), 'i');
                        $('.searchable tr').hide();
                        $('.searchable tr').filter(function () {
                            return rex.test($(this).text());
                        }).show();
                    //})
            });
         }(jQuery));


    $(function(){
      $('select[value]').each(function(){
        $(this).val(this.getAttribute("value"));
     });
     

    });
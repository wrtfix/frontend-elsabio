/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

//Variable globales
var inicio = 0;
var result = '';
var equipos = 2;
var proximo_equipo = 1;
var nombres=[];
var tiempo=60000;
var maxPuntos = 25;
var url = "http://elsabio.awardspace.us/index.php/welcome/getPreguntas";
var urlKey = "http://elsabio.awardspace.us/index.php/welcome/getKey";
var volumenAudio = true;

function regresiva(){
    var fiveSeconds = new Date().getTime() + tiempo;
    $("#clock").countdown(fiveSeconds, {elapse: false}).on('update.countdown', function(event) {
        var $this = $(this);
        $this.html(event.strftime('<span>%H:%M:%S</span>'));
    });
}

function validarGanador(equipo){
    var elem = "#"+nombres[proximo_equipo].replace(" ","_");
    var valor = parseInt($(elem).val());
    if (valor>=maxPuntos){
      $("#p5").hide();
      $("#p4").hide();
      $("#p3").hide();
      $("#p2").hide();
      $("#p1").show();
      alert("Ha ganado el equipo"+nombres[proximo_equipo]);
    }
    
}


function proximaPregunta(){
  return Math.floor((Math.random() * result.length));
}

function getProximoEquipo(){
    proximo_equipo = proximo_equipo + 1;
    if (proximo_equipo >= equipos)
        proximo_equipo = 0;
    return nombres[proximo_equipo];
}

function getPregunta(equipo){
    inicio = proximaPregunta();
    $("#pregunta").html("");
    $("#pregunta").append("<h2> <center> "+equipo+" <center> </h2>");
    $("#pregunta").append("<h3>"+result[inicio].pregunta+"</h3><p>"+result[inicio].opciones+"</p>");
    $("#showRespuesta").html("");
}

function getRespuesta(){
    $("#respuesta").html("");
    $("#respuesta").html("<h3>"+result[inicio].repuesta+"</h3>");
}


$(document).ready(function(){

    var audioElement = document.createElement('audio');
        audioElement.setAttribute('src', '../sounds/clock.ogg');
        audioElement.setAttribute('loop', 'loop');
        
    var audioElement2 = document.createElement('audio');
        audioElement2.setAttribute('src', '../sounds/correcto.ogg');

    var audioElement3 = document.createElement('audio');
        audioElement3.setAttribute('src', '../sounds/incorrecto.ogg');

    // window.onbeforeunload = function() {
    //     return "Dude, are you sure you want to leave? Think of the kittens!";
    // }    

    //TODO (Refactor) Validacion de perguntas existentes
    var save = localStorage.getItem("preguntas");
    if (save != null){
      result = JSON.parse(save);
    }
    if (result==""){
      $.getJSON( url, function(data) {
        localStorage.setItem("preguntas",  JSON.stringify(data));
        result = data;
      });
    }
    $("#p5").hide();
    $("#p4").hide();
    $("#p3").hide();
    $("#p2").hide();


    //TODO (Refactor) Validacion de actulizacion de nuevas preguntas
    var version = localStorage.getItem("version");
    if (save != null){
      max = JSON.parse(save);
    }
    if (result==""){
      $.getJSON( urlKey, function(data) {
        localStorage.setItem("version",  JSON.stringify(data));
        if (max < data){
          $.getJSON( url, function(data) {
            localStorage.setItem("preguntas",  JSON.stringify(data));
            result = data;
          })
          .done(function() {
            console.log( "second success" );
          });
        }
      })
      .done(function() {
        console.log( "second success" );
      });
    }




    $("#siguiente").click(function(){
        $("#clock").show();
        $("#p4").hide();
        $("#finalizar").hide();
        $("#p3").show();
        var proximo = getProximoEquipo();
        getPregunta(proximo);
        audioElement.play();
        $("#finalizar").show();
        regresiva();
        $("#correcto").show();
        var elem = "#"+nombres[proximo_equipo].replace(" ","_");
        var total = parseInt($(elem).val());
        $("#score").html("Score: "+total);
    });

    $("#agregarEquipos").click(function(){
      var aux = 1;
      equipos = $("#jugadores").val();
      $("#equipos").html("");
      for (i = 0; i < equipos; i++) { 
          $("#equipos").append("<div class='form-group form-group-lg'><label class='col-sm-2 control-label' for='formGroupInputLarge'>Equipo "+aux+"</label><div class='col-sm-10'><input type='text' class='nombre form-control' name='equipo"+i+"' value='Equipo "+aux+"'/></div>");
            aux = aux + 1;
      }
      $(".siguientep3").attr("disabled",false);
    });

    $("#siguientep2").click(function(){
        $("#p1").hide();
        $("#p2").show();
        $("#p3").hide();
    });

    $(".siguientep3").click(function(){
  
      
      equipos = $("#jugadores").val();
      $("#p1").hide();
      $("#p2").hide();
      $("#p3").show();
  
      $("#puntuacion").html("<tbody> <tr><td>Equipos</td><td>Puntaje</td></tr>");
      
      $(".nombre").each(function(elem){
        var nombre = $(this).val();
        nombres.push(nombre);
        $("#puntuacion").append("<tr><td>"+nombre+"</td><td><input type='text' id='"+nombre.replace(" ","_")+"' value='0' disabled></td></tr>");
      });    
      maxPuntos = parseInt($("#maxPuntos").val());
      $("#puntuacion").append("</tbody>");
        getPregunta(nombres[proximo_equipo]);
        audioElement.play();
        var valor = $("#tiempo").val();
        if (valor != ''){
            tiempo = valor * 1000;
        }
        regresiva();
        var elem = "#"+nombres[proximo_equipo].replace(" ","_");
        var total = parseInt($(elem).val());
        $("#score").html("Score: "+total);
     });

    $("#play").click(function(){
      $("#equipos").html("");
      var aux = 1;
      for (i = 0; i < equipos; i++) { 
          $("#equipos").append("<div class='form-group form-group-lg'><label class='col-sm-2 control-label' for='formGroupInputLarge'>Equipo "+aux+"</label><div class='col-sm-10'><input type='text' class='nombre form-control' name='equipo"+i+"' value='Equipo "+aux+"'/></div>");
            aux = aux + 1;
      }
      $(".siguientep3").trigger("click");
      $("#score").html("Score: "+valor);;
    });

    $("#finalizar").click(function(){
       $("#finalizar").attr("disabled",true);
       $("#correcto").attr("disabled",true);
       $("#p3").hide();
       $("#p4").show();
       $("#clock").hide();
       getRespuesta();
       audioElement.pause();
       audioElement3.play();
       inicio = inicio + 1;
       validarGanador(nombres[proximo_equipo]);
    });

    $("#verRespuesta").click(function(){
        $("#finalizar").attr("disabled",false);
        $("#correcto").attr("disabled",false);
       $("#showRespuesta").html("Repuesta: "+result[inicio].repuesta);
    });

    $("#correcto").click(function(){
        $("#finalizar").attr("disabled",true);
        $("#correcto").attr("disabled",true);
        var elem = "#"+nombres[proximo_equipo].replace(" ","_");
        var valor = parseInt($(elem).val()) + 1;
        $(elem).val(valor);
        audioElement2.play();
        getPregunta(nombres[proximo_equipo])
        $("#score").html("Score: "+valor);;
    });

    $("#help").click(function(){
        $("#p1").hide();
        $("#p5").show();
    });

    $("#okAyuda").click(function(){
        $("#p5").hide();
        $("#p1").show();
    });

    $("#sonido").hide();
    $("#mute").click(function(){
        $(this).hide();
        $("#sonido").show();
        audioElement.muted = true;  
        audioElement2.muted = true;  
        audioElement3.muted = true;  
    });
    $("#sonido").click(function(){
        $(this).hide();
        $("#mute").show();
        audioElement.muted = false;  
        audioElement2.muted = false;  
        audioElement3.muted = false;  
    });
});


app.initialize();
import {getCountry, getCurrencyCode} from './countriesInfo.js'
/*
//Using Parse Method to load data into Country Select Tag
const xmlhttp = new XMLHttpRequest();

xmlhttp.onload = function() {
const myObj = JSON.parse(this.responseText);
console.log(myObj);
console.log(myObj[0]["properties"]);
//console.log(myObj[0]['properties']['iso_a2']);
//console.log(myObj[0]['properties']['name']);
//console.log(myObj.features[0].properties.iso_a2);
//$('#txtContinent').html(result['data'][0]['continent']);
//console.log(myObj.features[1].properties.iso_a2);
}
xmlhttp.open("GET", "./php/countries.php");
xmlhttp.send();
*/

window.onload = function(){
	
	const successCallback = (position) => {
		console.log("The position = ",position);
		const latitude =  position.coords.latitude
		const longitude =  position.coords.longitude
		 //presetting weather for current location
		$.ajax({
			url: "php/openweathermap.php",
			type: 'GET',
			dataType: 'json',
			data: {
				lat: latitude,
				lng: longitude
			},
			success: function(result) {
				console.log("All weather result")
				// console.log(result.data);
				//console.log($('#lat').val());
				//var temp = "Tempearture" + result['data'][0].main.temp;
				//console.log(temp);
				

				const tableHeader =`<tr>
				<th scope="col">Date/Time</th>
					<th scope="col">Temperature</th>
					<th scope="col">Feels Like</th>
					<th scope="col">Min Temperature</th>
					<th scope="col">Max Temperature</th>
					<th scope="col">Description</th>
					</tr>`;		

				let tableData = '';
				for(let key in result.data){
					console.log("each object "+key)
					const date = new Date(key);
					const new_date = new Intl.DateTimeFormat('en-GB', { dateStyle: 'full'}).format(date);

					tableData += `<tr>
					<th colspan='6' style='background:#880000;color:yellow;font-size:16px;text-align:center;padding:5px'>${new_date}</th>							
					</tr>`;	
					for(let j in result.data[key]){
						tableData += `<tr>
						<td>${result.data[key][j].dt_txt}</td>
						<td>${result.data[key][j].main.temp}</td>
						<td>${result.data[key][j].main.feels_like}</td>
						<td>${result.data[key][j].main.temp_min}</td>
						<td>${result.data[key][j].main.temp_max}</td>
						<td>${result.data[key][j].weather[0].description}</td>
						
						</tr>`;			
					}
					//console.log(tableData);
				//document.querySelector('.tableData').innerHTML = tableData;
				
				$('.tableHeader').html(tableHeader);
				$('.tableData').html(tableData);
				}
			
			},
			error: function(jqXHR, textStatus, errorThrown) {
				// your error code
			}
		}); 

		//getting currency details basedon defauly cire
		$.ajax({
			url: "php/countriesRec.php",
			type: 'GET',
			dataType: 'json',
			success: function(result) {		
				const curLocation = getCountry()
				const objectData = result['data']
				const countryData = Object.entries(objectData.features)
				const filteredData = countryData.filter(([key,value]) => value.properties.name.trim() === curLocation.trim() )
				const cCode = filteredData[0][1].properties.iso_a2
				//console.log("My filteredData Code = ", cCode)
				const currencyCodeObj = getCurrencyCode(cCode)
				const curCode = Object.entries(currencyCodeObj)[0][1]
				console.log("My currencyCode ",curCode )
				$.ajax({
					url: "php/currencyDetails.php",
					type: 'GET',
					dataType: 'json',
					data: {
						currencies:curCode,
					},
					success: function(result) {
						//JSON.stringify(result)
						console.log("currency api",result.data);
		
		
					
						const exTableHeader =`<tr>
							<th scope="col">Currency</th>
							<th scope="col">Exchange Rate</th>							
							</tr>`;		
	
						let exTableData = '';
						for(let i in result.data){
							exTableData += `<tr>
							<td>${result.data[i].code}</td>
							<td>${result.data[i].value.toFixed(2)}</td>
							
							
							</tr>`;			
						
							//console.log(tableData);
						//document.querySelector('.tableData').innerHTML = tableData;
						
						$('.exTableHeader').html(exTableHeader);
						$('.exTableData').html(exTableData);
						}
					
					},
					error: function(jqXHR, textStatus, errorThrown) {
						// your error code
						console.log(errorThrown);
					}
				}); 
			
			}
			
		});

		
	
	};
	
	const errorCallback = (error) => {
		console.log("The error = ",error);
	};
	
	navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
	
	$.ajax({
		url: "php/countries.php",
		type: 'GET',
		dataType: 'json',
		success: function(result) {		
			const curLocation = getCountry()
			
			console.log("My Location ", curLocation)
			const objectData = result['data']
			console.log(objectData.features[0].properties.name);
			console.log(objectData.features[0].properties.iso_a2);
			var optionData = `<option>Select Country</option>`;
			for(let i in objectData.features){
				let selected = objectData.features[i].properties.name.trim() === curLocation.trim() ? "selected" : ""
				
				if(selected !== ""){
					
					const currencyCode = getCurrencyCode(objectData.features[i].properties.iso_a2)
					console.log("My countryCode ", currencyCode)
				}
				optionData += `<option ${selected} value=${objectData.features[i].properties.iso_a2}>
				${objectData.features[i].properties.name}
				</option>`;			
				}
			
			$('#country').html(optionData);
		}
		
	});



//Calling current location of device
currentLocation();

//***************************************************/
//Weather API

}
// call this method before you initialize your map.
function initializingMap() 
{
var container = L.DomUtil.get('map');
if(container != null){
container._leaflet_id = null;
}
}

//****************************************************/
//Current Location Function using PHP routine Curl
function currentLocation(){
	//
	var myMap = L.map('map').fitWorld();
	
	L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		}).addTo(myMap);
	
		function onLocationFound(e) {
			console.log("E Accuracy ",e)
			const radius = e.accuracy / 2;
		
			//calling the API
			$.ajax({
				url: "php/currentLocation.php",
				type: 'GET',
				dataType: 'json',
				data: {
					lat: e.latitude,
					lng: e.longitude
				},
				success: function(result) {
		
					console.log(JSON.stringify(result));
					//Values from hidden input type
					//console.log($('#lat').val());
					//console.log($('#lng').val());
					//Values from the API
					//console.log(result['data'][0].geometry.lat);
					//console.log(result['data'][0].geometry.lng);
					var lat = result['data'][0].geometry.lat;
					var lng = result['data'][0].geometry.lng;
					var callingcode = result['data'][0].annotations.callingcode;
					var isoCode = result['data'][0].annotations.currency.iso_code;
					var isoNumeric = result['data'][0].annotations.currency.iso_numeric;
					var subunit = result['data'][0].annotations.currency.subunit;
					var continent = result['data'][0].components.continent;
					var country = result['data'][0].components.country.toUpperCase();
					var countryCode = result['data'][0].components.country_code;
					var flag = result['data'][0].annotations.flag;
					var drive_on = result['data'][0].annotations.roadinfo.drive_on;
					var speed_in = result['data'][0].annotations.roadinfo.speed_in;
					var url = result['data'][0].annotations.OSM.url;
					var countryURL = `<a href=${url}  target="_blank"><button type="button" class="btn btn-primary">	Country URL </button></a>`

					$('.countryInfo').html(`${country}`);
					$('.countryURL').html(`${countryURL}`);
					//Map
					initializingMap();
					// Initialise Map
				/*
					var map = L.map('map').setView([lat, lng], 13);
								
					const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
						maxZoom: 19,
						subdomains: 'abcd',
						attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
					}).addTo(map);
				*/
				
				
				var base = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
					maxZoom: 19,
					subdomains: 'abcd',
					attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
				});
				
				var map = L.map('map', {
					layers: [base],
					tap: false, // ref https://github.com/Leaflet/Leaflet/issues/7255
					center: new L.LatLng(lat, lng),
					zoom: 5,
					fullscreenControl: true,
					fullscreenControlOptions: { // optional
						title:"Show me the fullscreen !",
						titleCancel:"Exit fullscreen mode"
					}
				//}).fitWorld();
				}).setView([lat, lng], 13);
				
				
				// detect fullscreen toggling
				map.on('enterFullscreen', function(){
					if(window.console) window.console.log('enterFullscreen');
				});
				map.on('exitFullscreen', function(){
					if(window.console) window.console.log('exitFullscreen');
				});

					const marker = L.marker([lat, lng]).addTo(map)
						//.bindPopup('<b>Hello world!</b><br />I am a popup.').openPopup();
					.bindPopup(`Continent: ${continent}</a>
								<br>Country: ${country}  
								<br>Country Code: ${countryCode}  
								<br>Calling code: ${callingcode}  
								<br>Iso Code: ${isoCode}  
								<br>Iso Numeric: ${isoNumeric}  
								<br>Sub unit: ${subunit}  
								<br>Latitude ${lat}   
								<br>Longtitude: ${lng}
								<br>Flag: ${flag}
								<br>Drive On: ${drive_on}
								<br>Speed In: ${speed_in}
								<br>${countryURL}`).openPopup();
	
					$('.map').html(marker);
				
					var popup = L.popup();
		
					function onMapClick(e) {
						popup
						.setLatLng(e.latlng)
						.setContent(`You clicked the map at ${e.latlng.toString()}`)
						.openOn(map);
					}

					map.on('click', onMapClick);
				
				},
				error: function(jqXHR, textStatus, errorThrown) {
					// your error code
				}
			}); 
			
			//const locationCircle = L.circle(e.latlng, radius).addTo(myMap);
			
		}
	
		function onLocationError(e) {
			alert(e.message);
		}
	
		myMap.on('locationfound', onLocationFound);
		myMap.on('locationerror', onLocationError);
	
		myMap.locate({setView: true, maxZoom: 16});
	
}


//***************************************************/
//Countries details API from opencagedata
    
$('#country').on('change',function() {
	//
	$.ajax({
		url: "php/selectedCountry.php",
		type: 'POST',
		dataType: 'json',
		data: {
			country: $('#country').val(),
			
		},
		success: function(result) {

			console.log(JSON.stringify(result));
			//console.log(result['data'][0].geometry.lat);
			//console.log(result['data'][0].geometry.lng);
			var lat = result['data'][0].geometry.lat;
			var lng = result['data'][0].geometry.lng;			
			var callingcode = result['data'][0].annotations.callingcode;
			var isoCode = result['data'][0].annotations.currency.iso_code;
			var isoNumeric = result['data'][0].annotations.currency.iso_numeric;
			var subunit = result['data'][0].annotations.currency.subunit;
			var continent = result['data'][0].components.continent;
			var country = result['data'][0].components.country;
			var countryCode = result['data'][0].components.country_code;
			var flag = result['data'][0].annotations.flag;
			var url = result['data'][0].annotations.OSM.url;
			var countryURL = `<a href=${url} target="_blank"><button type="button" class="btn btn-primary">	Country URL </button></a>`;
			const regionNamesInEnglish = new Intl.DisplayNames(['en'], { type: 'region' });
			const countryName = regionNamesInEnglish.of($('#country').val().trim()).toUpperCase();
			$('.countryInfo').html(`${countryName.toUpperCase()}`);
			$('.countryURL').html(`${countryURL}`);
			//Map
			initializingMap();
			// Initialise Map
			var map = L.map('map').setView([lat, lng], 13);
						
			const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
				maxZoom: 19,
				attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
			}).addTo(map);

			const marker = L.marker([lat, lng]).addTo(map)
				//.bindPopup('<b>Hello world!</b><br />I am a popup.').openPopup();
			.bindPopup(`Continent: ${continent}
						<br>Country: ${country}  
						<br>Country Code: ${countryCode}  
						<br>Calling code: ${callingcode}  
						<br>Iso Code: ${isoCode}  
						<br>Iso Numeric: ${isoNumeric}  
						<br>Sub unit: ${subunit}  
						<br>Latitude ${lat}   
						<br>Longtitude: ${lng}
						<br>Flag: ${flag}
						<br>${countryURL}`).openPopup();

			$('.map').html(marker);

			var popup = L.popup();
		
			function onMapClick(e) {
				popup
				.setLatLng(e.latlng)
				.setContent(`You clicked the map at ${e.latlng.toString()}`)
				.openOn(map);
			}

			map.on('click', onMapClick);
		},
		error: function(jqXHR, textStatus, errorThrown) {
			// your error code
		}
	}); 
    
	
	$.ajax({
		url: "php/updatedWeather.php",
		type: 'POST',
		dataType: 'json',
		data: {
			country: $('#country').val(),
		},
		success: function(result) {
			//$(".result").empty()
			console.log(JSON.stringify(result));
			const new_lat = result['data'][0].geometry.lat;
			const new_lng = result['data'][0].geometry.lng;
			
			console.log("New lat var",new_lat);
			console.log("New long var",new_lng); 
			
			$.ajax({
				url: "php/openweathermap.php",
				type: 'GET',
				dataType: 'json',
				data: {
					lat: new_lat,
					lng: new_lng
				},
				success: function(result) {
				//
					//$(".result tableHeader").empty();
					console.log("All result ", result)
					// console.log(result.data);
					//console.log($('#lat').val());
					//var temp = "Tempearture" + result['data'][0].main.temp;
					//console.log(temp);
					
		
					const tableHeader =`<tr>
					<th scope="col">Date/Time</th>
						<th scope="col">Temperature</th>
						<th scope="col">Feels Like</th>
						<th scope="col">Min Temperature</th>
						<th scope="col">Max Temperature</th>
						<th scope="col">Description</th>
						</tr>`;		
		
					let tableData = '';
					for(let key in result.data){
						console.log("each object "+key)
						const date = new Date(key);
						const new_date = new Intl.DateTimeFormat('en-GB', { dateStyle: 'full'}).format(date);
		
						tableData += `<tr>
						<th colspan='6' style='background:#880000;color:yellow;font-size:16px;text-align:center;padding:5px'>${new_date}</th>							
						</tr>`;	
						for(let j in result.data[key]){
							tableData += `<tr>
							<td>${result.data[key][j].dt_txt}</td>
							<td>${result.data[key][j].main.temp}</td>
							<td>${result.data[key][j].main.feels_like}</td>
							<td>${result.data[key][j].main.temp_min}</td>
							<td>${result.data[key][j].main.temp_max}</td>
							<td>${result.data[key][j].weather[0].description}</td>
							
							</tr>`;			
						}
						//console.log(tableData);
					//document.querySelector('.tableData').innerHTML = tableData;
					
					$('.tableHeader').html(tableHeader);
					$('.tableData').html(tableData);
					}
				
				},
				error: function(jqXHR, textStatus, errorThrown) {
					// your error code
					console.log("erreor",errorThrown)
				}
			});
		},
		async: false
	});
	
	$.ajax({
		url: "php/countriesRec.php",
		type: 'GET',
		dataType: 'json',
		data: {
			country: $('#country').val(),
		},
		success: function(result) {		
			//const selectedLocation = getCountry()
			const selectedLocation = $('#country').val()
			// console.log("My currencyCode onChange ",selectedLocation )
			// const objectData = result['data']
			// const countryData = Object.entries(objectData.features)
			// const filteredData = countryData.filter(([key,value]) => value.properties.name.trim() === selectedLocation.trim() )
			// const cCode = filteredData[0][1].properties.iso_a2
			//console.log("My filteredData Code = ", cCode)
			const currencyCodeObj = getCurrencyCode(selectedLocation)
			const curCode = Object.entries(currencyCodeObj)[0][1]
			
			$.ajax({
				url: "php/currencyDetails.php",
				type: 'GET',
				dataType: 'json',
				data: {
					currencies:curCode,
				},
				success: function(result) {
					//JSON.stringify(result)
					console.log("currency api",result.data);
	
	
				
					const exTableHeader =`<tr>
						<th scope="col">Currency</th>
						<th scope="col">Exchange Rate</th>							
						</tr>`;		

					let exTableData = '';
					for(let i in result.data){
						exTableData += `<tr>
						<td>${result.data[i].code}</td>
						<td>${result.data[i].value.toFixed(2)}</td>
						
						
						</tr>`;			
					
						//console.log(tableData);
					//document.querySelector('.tableData').innerHTML = tableData;
					
					$('.exTableHeader').html(exTableHeader);
					$('.exTableData').html(exTableData);
					}
				
				},
				error: function(jqXHR, textStatus, errorThrown) {
					// your error code
					console.log(errorThrown);
				}
			}); 
		
		}
		
	});

});


